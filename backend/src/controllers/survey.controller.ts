import { Request, Response } from 'express';
import { prisma } from '../config/db.config';
import { createError, asyncHandler } from '../middleware/error.middleware';
import { z } from 'zod';
import { matchingService } from '../services/matching.service';
import { logger } from '../utils/logger';

// Validation schemas
const submitResponseSchema = z.object({
  questionId: z.string().uuid(),
  answerText: z.string().optional(),
  answerValue: z.number().optional(),
  answerType: z.enum(['multiple_choice', 'scale', 'text', 'ranking', 'multiple_select']),
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

    // Get active campaign to link response
    const activeCampaign = await prisma.campaign.findFirst({
      where: { isActive: true }
    });

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
        campaignId: activeCampaign?.id,
      },
      create: {
        userId: req.user!.id,
        questionId,
        answerText,
        answerValue,
        answerType,
        campaignId: activeCampaign?.id,
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
    // Get active campaign
    const activeCampaign = await prisma.campaign.findFirst({
      where: { isActive: true }
    });

    // Check if user has answered all ACTIVE questions for the active campaign
    const activeQuestions = await prisma.question.findMany({
      where: {
        isActive: true,
        campaignId: activeCampaign?.id
      },
      select: { id: true }
    });

    const totalQuestionsCount = activeQuestions.length;
    const activeQuestionIds = activeQuestions.map(q => q.id);

    const responses = await prisma.surveyResponse.findMany({
      where: {
        userId: req.user!.id,
        questionId: { in: activeQuestionIds }
      },
      select: { questionId: true }
    });

    const answeredCount = responses.length;

    console.log(`Survey completion check: User ${req.user!.id} - Campaign ${activeCampaign?.id || 'none'} - ${answeredCount}/${totalQuestionsCount} active questions answered`);

    // Validation - Allow completion if they have answered most questions (lenience for potential data issues)
    // but warn if they are missing more than 2. Wait, the user said 20 questions.
    if (totalQuestionsCount > 0 && answeredCount < totalQuestionsCount) {
      throw createError(`Please complete all questions (${answeredCount}/${totalQuestionsCount} answered)`, 400);
    }

    // Mark survey as completed
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { surveyCompleted: true },
    });

    // Automatically trigger match generation so they can see results immediately
    // The activeCampaign is already defined above
    if (activeCampaign) {
      logger.info(`Survey completed for user ${req.user!.id}. Triggering match generation for campaign ${activeCampaign.id}...`);
      // We don't necessarily need to await this if we want it to be fast, but for small sets it's fine.
      // Actually, awaiting ensures the matches are ready when the user redirects to /matches
      try {
        await matchingService.generateAllMatches(activeCampaign.id);
      } catch (matchError) {
        logger.error('Failed to generate matches after survey completion:', matchError);
        // Don't fail the whole request because matches didn't generate - they can retry later
      }
    }

    res.json({
      success: true,
      message: 'Survey completed successfully! Your matches are ready.',
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
