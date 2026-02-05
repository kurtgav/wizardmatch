import { Request, Response } from 'express';
import { prisma } from '../config/db.config';
import { createError, asyncHandler } from '../middleware/error.middleware';
import { matchingService } from '../services/matching.service';
import { z } from 'zod';
import { logger } from '../utils/logger';

// Validation schemas
const markInterestSchema = z.object({
  interested: z.boolean(),
});

const reportMatchSchema = z.object({
  reason: z.string().min(10).max(500),
});

export const matchingController = {
  // NEW: Get potential matches (users you haven't interacted with yet)
  getPotentialMatches: asyncHandler(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { surveyCompleted: true, gender: true, seekingGender: true },
    });

    if (!user?.surveyCompleted) {
      throw createError('Please complete the survey first', 400);
    }

    // Get IDs of users current user has already interacted with
    const interactions = await prisma.interaction.findMany({
      where: { userId: req.user!.id },
      select: { matchId: true },
    });

    const interactedMatchIds = interactions.map(i => i.matchId);

    // Get matches involving current user
    const existingMatches = await prisma.match.findMany({
      where: {
        OR: [
          { user1Id: req.user!.id },
          { user2Id: req.user!.id },
        ],
      },
      select: { id: true },
    });

    const existingMatchIds = existingMatches.map(m => m.id);

    // Get all users who:
    // 1. Have completed the survey
    // 2. Are not the current user
    // 3. Are not in existing matches
    // 4. Match gender preferences (if specified)
    const genderFilter = user.seekingGender && user.seekingGender !== 'Any'
      ? { gender: user.seekingGender }
      : {};

    const potentialUsers = await prisma.user.findMany({
      where: {
        id: { not: req.user!.id },
        surveyCompleted: true,
        ...genderFilter,
        NOT: {
          OR: [
            { user1Matches: { some: { id: { in: existingMatchIds } } } },
            { user2Matches: { some: { id: { in: existingMatchIds } } } },
          ],
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        program: true,
        yearLevel: true,
        profilePhotoUrl: true,
        bio: true,
        gender: true,
      },
      take: 50, // Limit to 50 potential matches at a time
    });

    res.json({
      success: true,
      data: potentialUsers,
      count: potentialUsers.length,
    });
  }),

  // NEW: Pass on a user (Tinder-style X button)
  passUser: asyncHandler(async (req: Request, res: Response) => {
    const { targetUserId } = req.params;

    // Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw createError('User not found', 404);
    }

    if (targetUserId === req.user!.id) {
      throw createError('Cannot pass yourself', 400);
    }

    // Check if a match already exists
    const existingMatch = await prisma.match.findFirst({
      where: {
        OR: [
          { user1Id: req.user!.id, user2Id: targetUserId },
          { user1Id: targetUserId, user2Id: req.user!.id },
        ],
      },
    });

    if (existingMatch) {
      // Update match to show user2 passed
      await prisma.interaction.create({
        data: {
          matchId: existingMatch.id,
          userId: req.user!.id,
          interactionType: 'not_interested',
          metadata: { timestamp: new Date().toISOString() },
        },
      });

      return res.json({
        success: true,
        message: 'Pass recorded',
      });
    }

    // No match exists yet - create a "pending" match
    const match = await prisma.match.create({
      data: {
        user1Id: req.user!.id,
        user2Id: targetUserId,
        compatibilityScore: 0, // Will be calculated if both interested
        matchTier: 'pending',
        isRevealed: false,
        isMutualInterest: false,
        messagingUnlocked: false,
      },
    });

    // Record pass interaction
    await prisma.interaction.create({
      data: {
        matchId: match.id,
        userId: req.user!.id,
        interactionType: 'not_interested',
      },
    });

    logger.info(`User ${req.user!.id} passed on user ${targetUserId}`);

    res.json({
      success: true,
      message: 'Pass recorded',
    });
  }),

  // NEW: Express interest in a user (Tinder-style ✔ button)
  interestUser: asyncHandler(async (req: Request, res: Response) => {
    const { targetUserId } = req.params;

    // Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw createError('User not found', 404);
    }

    if (targetUserId === req.user!.id) {
      throw createError('Cannot match with yourself', 400);
    }

    // Check if a match already exists
    const existingMatch = await prisma.match.findFirst({
      where: {
        OR: [
          { user1Id: req.user!.id, user2Id: targetUserId },
          { user1Id: targetUserId, user2Id: req.user!.id },
        ],
      },
      include: {
        interactions: true,
      },
    });

    if (existingMatch) {
      // Check if target user already passed
      const targetPassed = existingMatch.interactions.some(
        i => i.userId === targetUserId && i.interactionType === 'not_interested'
      );

      if (targetPassed) {
        return res.json({
          success: true,
          message: 'You are interested, but they passed. No match.',
          matched: false,
        });
      }

      // Check if target user is also interested
      const targetInterested = existingMatch.interactions.some(
        i => i.userId === targetUserId && i.interactionType === 'interest'
      );

      // Record interest
      await prisma.interaction.create({
        data: {
          matchId: existingMatch.id,
          userId: req.user!.id,
          interactionType: 'interest',
        },
      });

      if (targetInterested) {
        // MUTUAL INTEREST! UNLOCK MESSAGING
        await prisma.match.update({
          where: { id: existingMatch.id },
          data: {
            isMutualInterest: true,
            messagingUnlocked: true,
          },
        });

        logger.info(`MUTUAL MATCH created: User ${req.user!.id} <-> User ${targetUserId}`);

        return res.json({
          success: true,
          message: 'It\'s a match! You both like each other!',
          matched: true,
          matchId: existingMatch.id,
        });
      }

      return res.json({
        success: true,
        message: 'Interest recorded! Waiting for them to respond.',
        matched: false,
      });
    }

    // No match exists yet - create one and record interest
    const match = await prisma.match.create({
      data: {
        user1Id: req.user!.id,
        user2Id: targetUserId,
        compatibilityScore: 0,
        matchTier: 'pending',
        isRevealed: false,
        isMutualInterest: false,
        messagingUnlocked: false,
      },
    });

    // Record interest
    await prisma.interaction.create({
      data: {
        matchId: match.id,
        userId: req.user!.id,
        interactionType: 'interest',
      },
    });

    logger.info(`User ${req.user!.id} expressed interest in user ${targetUserId}`);

    res.json({
      success: true,
      message: 'Interest recorded!',
      matched: false,
    });
  }),

  getMatches: asyncHandler(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { surveyCompleted: true },
    });

    if (!user?.surveyCompleted) {
      throw createError('Please complete the survey first', 400);
    }

    // Get matches where current user is either user1 or user2
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { user1Id: req.user!.id },
          { user2Id: req.user!.id },
        ],
      },
      include: {
        user1: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            program: true,
            yearLevel: true,
            profilePhotoUrl: true,
            bio: true,
          },
        },
        user2: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            program: true,
            yearLevel: true,
            profilePhotoUrl: true,
            bio: true,
          },
        },
      },
      orderBy: { compatibilityScore: 'desc' },
    });

    // Format matches to show the other user
    const formattedMatches = matches.map(match => {
      const isUser1 = match.user1Id === req.user!.id;
      const matchedUser = isUser1 ? match.user2 : match.user1;

      return {
        id: match.id,
        matchedUser: {
          id: matchedUser.id,
          firstName: matchedUser.firstName,
          lastName: matchedUser.lastName.charAt(0) + '.', // Only show initial
          program: matchedUser.program,
          yearLevel: matchedUser.yearLevel,
          profilePhotoUrl: match.isRevealed ? matchedUser.profilePhotoUrl : null,
          bio: match.isRevealed ? matchedUser.bio : null,
        },
        compatibilityScore: Number(match.compatibilityScore),
        matchTier: match.matchTier,
        sharedInterests: match.sharedInterests,
        isRevealed: match.isRevealed,
        isMutualInterest: match.isMutualInterest,
      };
    });

    res.json({
      success: true,
      data: formattedMatches,
      count: formattedMatches.length,
    });
  }),

  getMatchById: asyncHandler(async (req: Request, res: Response) => {
    const { matchId } = req.params;

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        user1: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            program: true,
            yearLevel: true,
            profilePhotoUrl: true,
            bio: true,
            instagramHandle: true,
            facebookProfile: true,
          },
        },
        user2: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            program: true,
            yearLevel: true,
            profilePhotoUrl: true,
            bio: true,
            instagramHandle: true,
            facebookProfile: true,
          },
        },
      },
    });

    if (!match) {
      throw createError('Match not found', 404);
    }

    // Verify user is part of this match
    if (match.user1Id !== req.user!.id && match.user2Id !== req.user!.id) {
      throw createError('Access denied', 403);
    }

    const isUser1 = match.user1Id === req.user!.id;
    const matchedUser = isUser1 ? match.user2 : match.user1;

    res.json({
      success: true,
      data: {
        id: match.id,
        matchedUser: {
          id: matchedUser.id,
          firstName: matchedUser.firstName,
          lastName: matchedUser.lastName.charAt(0) + '.',
          program: matchedUser.program,
          yearLevel: matchedUser.yearLevel,
          profilePhotoUrl: match.isRevealed ? matchedUser.profilePhotoUrl : null,
          bio: match.isRevealed ? matchedUser.bio : null,
          instagramHandle: match.isRevealed ? matchedUser.instagramHandle : null,
          facebookProfile: match.isRevealed ? matchedUser.facebookProfile : null,
        },
        compatibilityScore: Number(match.compatibilityScore),
        matchTier: match.matchTier,
        sharedInterests: match.sharedInterests,
        isRevealed: match.isRevealed,
        isMutualInterest: match.isMutualInterest,
      },
    });
  }),

  revealMatch: asyncHandler(async (req: Request, res: Response) => {
    const { matchId } = req.params;

    // Verify match exists and user is part of it
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw createError('Match not found', 404);
    }

    if (match.user1Id !== req.user!.id && match.user2Id !== req.user!.id) {
      throw createError('Access denied', 403);
    }

    // Update match to revealed
    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: { isRevealed: true, revealedAt: new Date() },
    });

    res.json({
      success: true,
      data: {
        isRevealed: updatedMatch.isRevealed,
        revealedAt: updatedMatch.revealedAt,
      },
      message: 'Match revealed successfully',
    });
  }),

  markInterest: asyncHandler(async (req: Request, res: Response) => {
    const { matchId } = req.params;
    const { interested } = markInterestSchema.parse(req.body);

    // Verify match exists and user is part of it
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw createError('Match not found', 404);
    }

    if (match.user1Id !== req.user!.id && match.user2Id !== req.user!.id) {
      throw createError('Access denied', 403);
    }

    // Record interaction
    await prisma.interaction.create({
      data: {
        matchId,
        userId: req.user!.id,
        interactionType: interested ? 'interest' : 'not_interested',
        metadata: { timestamp: new Date().toISOString() },
      },
    });

    // If interested, check if other person is also interested
    if (interested) {
      const otherUserInterest = await prisma.interaction.findFirst({
        where: {
          matchId,
          userId: { not: req.user!.id },
          interactionType: 'interest',
        },
      });

      if (otherUserInterest) {
        // Mutual interest! Mark match as mutual
        await prisma.match.update({
          where: { id: matchId },
          data: { isMutualInterest: true },
        });

        return res.json({
          success: true,
          data: { isMutualInterest: true },
          message: 'It\'s a match! You both are interested in each other!',
        });
      }
    }

    res.json({
      success: true,
      message: 'Interest recorded',
    });
  }),

  reportMatch: asyncHandler(async (req: Request, res: Response) => {
    const { matchId } = req.params;
    const { reason } = reportMatchSchema.parse(req.body);

    // Verify match exists and user is part of it
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw createError('Match not found', 404);
    }

    if (match.user1Id !== req.user!.id && match.user2Id !== req.user!.id) {
      throw createError('Access denied', 403);
    }

    // Create report interaction
    await prisma.interaction.create({
      data: {
        matchId,
        userId: req.user!.id,
        interactionType: 'report',
        metadata: { reason },
      },
    });

    // TODO: Send email to admins about the report

    res.json({
      success: true,
      message: 'Report submitted. We will review it shortly.',
    });
  }),
};
