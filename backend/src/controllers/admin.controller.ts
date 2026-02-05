import { Request, Response } from 'express';
import { prisma } from '../config/db.config';
import { createError, asyncHandler } from '../middleware/error.middleware';
import { matchingService } from '../services/matching.service';
import { aiMatchingService } from '../services/ai-matching.service';
import { z } from 'zod';

// Validation schemas
const createQuestionSchema = z.object({
  category: z.string(),
  questionText: z.string().min(5),
  questionType: z.enum(['multiple_choice', 'scale', 'text', 'ranking']),
  options: z.any().optional(),
  weight: z.number().min(0).max(10).optional(),
  orderIndex: z.number().int().optional(),
});

const updateSettingsSchema = z.object({
  key: z.string(),
  value: z.any(),
});

const createManualMatchSchema = z.object({
  user1Id: z.string().uuid(),
  user2Id: z.string().uuid(),
  compatibilityScore: z.number().min(0).max(100).optional(),
});

export const adminController = {
  getPublicStats: asyncHandler(async (req: Request, res: Response) => {
    const [
      totalUsers,
      completedSurveys,
      totalMatches,
      matchReleaseSetting,
    ] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: true, surveyCompleted: true } }),
      prisma.match.count(),
      prisma.adminSetting.findUnique({ where: { settingKey: 'matchReleaseDate' } }),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        completedSurveys,
        totalMatches,
        matchReleaseDate: matchReleaseSetting?.settingValue || new Date('2026-02-14T00:00:00Z'),
      },
    });
  }),

  getStats: asyncHandler(async (req: Request, res: Response) => {
    const [
      totalUsers,
      completedSurveys,
      totalMatches,
      activeUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { surveyCompleted: true } }),
      prisma.match.count(),
      prisma.user.count({ where: { isActive: true } }),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        completedSurveys,
        totalMatches,
        activeUsers,
        completionRate: totalUsers > 0 ? (completedSurveys / totalUsers) * 100 : 0,
      },
    });
  }),

  getUsers: asyncHandler(async (req: Request, res: Response) => {
    const { page = '1', limit = '50', search } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where = search
      ? {
        OR: [
          { firstName: { contains: String(search), mode: 'insensitive' as const } },
          { lastName: { contains: String(search), mode: 'insensitive' as const } },
          { email: { contains: String(search), mode: 'insensitive' as const } },
          { studentId: { contains: String(search), mode: 'insensitive' as const } },
        ],
      }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          email: true,
          studentId: true,
          firstName: true,
          lastName: true,
          program: true,
          yearLevel: true,
          surveyCompleted: true,
          isActive: true,
          createdAt: true,
          lastLogin: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  }),

  updateUser: asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const data = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        program: true,
        yearLevel: true,
        isActive: true,
        surveyCompleted: true,
      },
    });

    res.json({
      success: true,
      data: user,
      message: 'User updated successfully',
    });
  }),

  deleteUser: asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  }),

  createQuestion: asyncHandler(async (req: Request, res: Response) => {
    const validatedData = createQuestionSchema.parse(req.body);

    const question = await prisma.question.create({
      data: {
        ...validatedData,
        orderIndex: validatedData.orderIndex ?? 0,
      },
    });

    res.json({
      success: true,
      data: question,
      message: 'Question created successfully',
    });
  }),

  updateQuestion: asyncHandler(async (req: Request, res: Response) => {
    const { questionId } = req.params;
    const data = req.body;

    const question = await prisma.question.update({
      where: { id: questionId },
      data,
    });

    res.json({
      success: true,
      data: question,
      message: 'Question updated successfully',
    });
  }),

  deleteQuestion: asyncHandler(async (req: Request, res: Response) => {
    const { questionId } = req.params;

    await prisma.question.delete({
      where: { id: questionId },
    });

    res.json({
      success: true,
      message: 'Question deleted successfully',
    });
  }),

  generateMatches: asyncHandler(async (req: Request, res: Response) => {
    // Get active campaign
    const campaign = await prisma.campaign.findFirst({
      where: { isActive: true },
    });

    if (!campaign) {
      throw createError('No active campaign found', 404);
    }

    // Trigger match generation
    const result = await matchingService.generateAllMatches(campaign.id);

    res.json({
      success: true,
      data: result,
      message: `Generated ${result.matchesCreated} matches successfully`,
    });
  }),

  /**
   * Generate AI-powered matches using LLM for compatibility scoring
   */
  generateAIMatches: asyncHandler(async (req: Request, res: Response) => {
    // Get active campaign
    const campaign = await prisma.campaign.findFirst({
      where: { isActive: true },
    });

    if (!campaign) {
      throw createError('No active campaign found', 404);
    }

    // Trigger AI match generation
    const result = await aiMatchingService.generateAIMatches(campaign.id);

    res.json({
      success: true,
      data: result,
      message: `AI-powered matching complete: ${result.matchesCreated} matches generated from ${result.usersProcessed} users (avg. score: ${result.averageScore}%)`,
    });
  }),

  getAllMatches: asyncHandler(async (req: Request, res: Response) => {
    const { page = '1', limit = '50' } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [matches, total] = await Promise.all([
      prisma.match.findMany({
        skip,
        take,
        include: {
          user1: {
            select: {
              firstName: true,
              lastName: true,
              program: true,
            },
          },
          user2: {
            select: {
              firstName: true,
              lastName: true,
              program: true,
            },
          },
        },
        orderBy: { compatibilityScore: 'desc' },
      }),
      prisma.match.count(),
    ]);

    res.json({
      success: true,
      data: matches,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  }),

  updateSettings: asyncHandler(async (req: Request, res: Response) => {
    const { key, value } = updateSettingsSchema.parse(req.body);

    const setting = await prisma.adminSetting.upsert({
      where: { settingKey: key },
      update: { settingValue: value, updatedBy: req.user!.id },
      create: { settingKey: key, settingValue: value, updatedBy: req.user!.id },
    });

    res.json({
      success: true,
      data: setting,
      message: 'Setting updated successfully',
    });
  }),

  getTestimonials: asyncHandler(async (req: Request, res: Response) => {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: testimonials,
    });
  }),

  getPublishedTestimonials: asyncHandler(async (req: Request, res: Response) => {
    const testimonials = await prisma.testimonial.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: testimonials,
    });
  }),

  createTestimonial: asyncHandler(async (req: Request, res: Response) => {
    const { authorName, program, title, content } = req.body;

    if (!authorName || !content) {
      throw createError('Author name and content are required', 400);
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        name: authorName || 'Anonymous',
        email: program || null,
        heading: title || 'Success Story',
        content,
        isApproved: false,
        isPublished: false,
      },
    });

    res.json({
      success: true,
      data: testimonial,
      message: 'Testimonial submitted successfully! It will be reviewed before being published.',
    });
  }),

  approveTestimonial: asyncHandler(async (req: Request, res: Response) => {
    const { testimonialId } = req.params;
    const { isApproved, isPublished } = req.body;

    const testimonial = await prisma.testimonial.update({
      where: { id: testimonialId },
      data: { isApproved, isPublished },
    });

    res.json({
      success: true,
      data: testimonial,
      message: 'Testimonial updated successfully',
    });
  }),

  getEligibleUsers: asyncHandler(async (req: Request, res: Response) => {
    // Users who completed the survey
    const users = await prisma.user.findMany({
      where: {
        surveyCompleted: true,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        program: true,
        gender: true,
        seekingGender: true,
      },
      orderBy: { firstName: 'asc' },
    });

    res.json({
      success: true,
      data: users,
    });
  }),

  createManualMatch: asyncHandler(async (req: Request, res: Response) => {
    const { user1Id, user2Id, compatibilityScore = 100 } = createManualMatchSchema.parse(req.body);

    if (user1Id === user2Id) {
      throw createError('Cannot match a user with themselves', 400);
    }

    // Get active campaign
    const campaign = await prisma.campaign.findFirst({
      where: { isActive: true },
    });

    // Check if both users exist and completed survey
    const [u1, u2] = await Promise.all([
      prisma.user.findUnique({ where: { id: user1Id } }),
      prisma.user.findUnique({ where: { id: user2Id } }),
    ]);

    if (!u1 || !u2) {
      throw createError('One or both users not found', 404);
    }

    // Check for existing match
    const existingMatch = await prisma.match.findFirst({
      where: {
        OR: [
          { user1Id, user2Id },
          { user1Id: user2Id, user2Id: user1Id },
        ],
      },
    });

    if (existingMatch) {
      // Update existing match
      const updatedMatch = await prisma.match.update({
        where: { id: existingMatch.id },
        data: {
          compatibilityScore,
          matchTier: 'perfect',
          isRevealed: false,
        },
      });

      return res.json({
        success: true,
        data: updatedMatch,
        message: 'Match updated successfully',
      });
    }

    // Create new match
    const match = await prisma.match.create({
      data: {
        user1Id,
        user2Id,
        campaignId: campaign?.id,
        compatibilityScore,
        matchTier: 'perfect',
        isRevealed: false,
      },
    });

    res.json({
      success: true,
      data: match,
      message: 'Match created successfully',
    });
  }),

  deleteMatch: asyncHandler(async (req: Request, res: Response) => {
    const { matchId } = req.params;

    await prisma.match.delete({
      where: { id: matchId },
    });

    res.json({
      success: true,
      message: 'Match deleted successfully',
    });
  }),
};
