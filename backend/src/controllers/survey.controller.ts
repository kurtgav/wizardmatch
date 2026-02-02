import { Request, Response } from 'express';
import { prisma } from '../config/db.config';
import { createError, asyncHandler } from '../middleware/error.middleware';
import { z } from 'zod';

// Validation schemas
const submitResponseSchema = z.object({
  questionId: z.string().uuid(),
  answerText: z.string().optional(),
  answerValue: z.number().optional(),
  answerType: z.enum(['multiple_choice', 'scale', 'text', 'ranking']),
});

export const surveyController = {
  getQuestions: asyncHandler(async (req: Request, res: Response) => {
    const questions = await prisma.question.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: 'asc' },
      select: {
        id: true,
        category: true,
        questionText: true,
        questionType: true,
        options: true,
        orderIndex: true,
      },
    });

    // Group questions by category
    const groupedQuestions = questions.reduce((acc, question) => {
      if (!acc[question.category]) {
        acc[question.category] = [];
      }
      acc[question.category].push(question);
      return acc;
    }, {} as Record<string, typeof questions>);

    res.json({
      success: true,
      data: groupedQuestions,
    });
  }),

  submitResponse: asyncHandler(async (req: Request, res: Response) => {
    const { questionId, answerText, answerValue, answerType } = submitResponseSchema.parse(req.body);

    // Check if question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw createError('Question not found', 404);
    }

    // Create or update response
    const response = await prisma.surveyResponse.upsert({
      where: {
        userId_questionId: {
          userId: req.user!.id,
          questionId,
        },
      },
      update: {
        answerText,
        answerValue,
        answerType,
      },
      create: {
        userId: req.user!.id,
        questionId,
        answerText,
        answerValue,
        answerType,
      },
    });

    res.json({
      success: true,
      data: response,
      message: 'Response saved successfully',
    });
  }),

  getResponses: asyncHandler(async (req: Request, res: Response) => {
    const responses = await prisma.surveyResponse.findMany({
      where: { userId: req.user!.id },
      include: {
        question: {
          select: {
            id: true,
            category: true,
            questionText: true,
            questionType: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({
      success: true,
      data: responses,
    });
  }),

  completeSurvey: asyncHandler(async (req: Request, res: Response) => {
    // Check if user has answered all questions
    const totalQuestions = await prisma.question.count({
      where: { isActive: true },
    });

    const answeredQuestions = await prisma.surveyResponse.count({
      where: { userId: req.user!.id },
    });

    console.log(`Survey completion check: User ${req.user!.id} - ${answeredQuestions}/${totalQuestions} answered`);

    if (answeredQuestions < totalQuestions) {
      throw createError(`Please complete all questions (${answeredQuestions}/${totalQuestions} answered)`, 400);
    }

    // Mark survey as completed
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { surveyCompleted: true },
    });

    res.json({
      success: true,
      message: 'Survey completed successfully! Your matches will be available soon.',
    });
  }),

  getProgress: asyncHandler(async (req: Request, res: Response) => {
    const totalQuestions = await prisma.question.count({
      where: { isActive: true },
    });

    const answeredQuestions = await prisma.surveyResponse.count({
      where: { userId: req.user!.id },
    });

    const progress = {
      total: totalQuestions,
      answered: answeredQuestions,
      percentage: Math.round((answeredQuestions / totalQuestions) * 100),
    };

    res.json({
      success: true,
      data: progress,
    });
  }),
};
