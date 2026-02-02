import { Request, Response } from 'express';
import { prisma } from '../config/db.config';
import { asyncHandler } from '../middleware/error.middleware';

export const publicController = {
  // Public stats for landing page
  getPublicStats: asyncHandler(async (req: Request, res: Response) => {
    const [
      totalUsers,
      completedSurveys,
      totalMatches,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { surveyCompleted: true } }),
      prisma.match.count(),
    ]);

    // Get match release date from settings
    const releaseDateSetting = await prisma.adminSetting.findUnique({
      where: { settingKey: 'matchReleaseDate' },
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        completedSurveys,
        totalMatches,
        matchReleaseDate: releaseDateSetting?.settingValue || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });
  }),
};
