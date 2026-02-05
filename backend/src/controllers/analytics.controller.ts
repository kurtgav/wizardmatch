import { Request, Response } from 'express';
import { prisma } from '../config/db.config';
import { asyncHandler } from '../middleware/error.middleware';

export const analyticsController = {
  getOverview: asyncHandler(async (req: Request, res: Response) => {
    const [
      totalParticipants,
      completedSurveys,
      totalMatches,
      mutualMatches,
    ] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({
        where: { isActive: true, surveyCompleted: true },
      }),
      prisma.match.count(),
      prisma.match.count({ where: { isMutualInterest: true } }),
    ]);

    // Average compatibility score
    const avgScoreResult = await prisma.match.aggregate({
      _avg: { compatibilityScore: true },
    });

    // Top programs by participation
    const topPrograms = await prisma.user.groupBy({
      by: ['program'],
      where: { surveyCompleted: true },
      _count: { program: true },
      orderBy: { _count: { program: 'desc' } },
      take: 10,
    });

    res.json({
      success: true,
      data: {
        totalParticipants,
        completedSurveys,
        totalMatches,
        mutualMatches,
        averageCompatibilityScore: Number(avgScoreResult._avg.compatibilityScore || 0),
        topPrograms: topPrograms.map((p: any) => ({
          program: p.program,
          count: p._count.program,
        })),
      },
    });
  }),

  getParticipants: asyncHandler(async (req: Request, res: Response) => {
    const total = await prisma.user.count({ where: { isActive: true } });
    const completed = await prisma.user.count({
      where: { isActive: true, surveyCompleted: true },
    });

    // Get participants by day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailySignups = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: { id: true },
    });

    res.json({
      success: true,
      data: {
        total,
        completed,
        completionRate: total > 0 ? (completed / total) * 100 : 0,
        dailySignups,
      },
    });
  }),

  getByProgram: asyncHandler(async (req: Request, res: Response) => {
    const programStats = await prisma.user.groupBy({
      by: ['program'],
      where: { isActive: true },
      _count: { program: true },
      orderBy: { _count: { program: 'desc' } },
    });

    // Include survey completion by program
    const programStatsWithCompletion = await Promise.all(
      programStats.map(async (stat: any) => {
        const completed = await prisma.user.count({
          where: {
            program: stat.program,
            surveyCompleted: true,
            isActive: true,
          },
        });

        return {
          program: stat.program,
          total: stat._count.program,
          completed,
          completionRate: (completed / stat._count.program) * 100,
        };
      })
    );

    res.json({
      success: true,
      data: programStatsWithCompletion,
    });
  }),

  getByYearLevel: asyncHandler(async (req: Request, res: Response) => {
    const yearStats = await prisma.user.groupBy({
      by: ['yearLevel'],
      where: { isActive: true },
      _count: { yearLevel: true },
    });

    // Include survey completion by year level
    const yearStatsWithCompletion = await Promise.all(
      yearStats.map(async (stat: any) => {
        const completed = await prisma.user.count({
          where: {
            yearLevel: stat.yearLevel,
            surveyCompleted: true,
            isActive: true,
          },
        });

        return {
          yearLevel: stat.yearLevel,
          total: stat._count.yearLevel,
          completed,
          completionRate: (completed / stat._count.yearLevel) * 100,
        };
      })
    );

    res.json({
      success: true,
      data: yearStatsWithCompletion.sort((a, b) => (a.yearLevel || 0) - (b.yearLevel || 0)),
    });
  }),

  getSuccessRate: asyncHandler(async (req: Request, res: Response) => {
    const totalMatches = await prisma.match.count();
    const mutualMatches = await prisma.match.count({
      where: { isMutualInterest: true },
    });
    const revealedMatches = await prisma.match.count({
      where: { isRevealed: true },
    });

    // Get matches by tier
    const matchesByTier = await prisma.match.groupBy({
      by: ['matchTier'],
      _count: { matchTier: true },
    });

    res.json({
      success: true,
      data: {
        totalMatches,
        mutualMatches,
        revealedMatches,
        mutualMatchRate: totalMatches > 0 ? (mutualMatches / totalMatches) * 100 : 0,
        revealRate: totalMatches > 0 ? (revealedMatches / totalMatches) * 100 : 0,
        matchesByTier: matchesByTier.map((m: any) => ({
          tier: m.matchTier,
          count: m._count.matchTier,
        })),
      },
    });
  }),
};
