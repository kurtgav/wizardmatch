import { Request, Response } from 'express';
import { prisma } from '../config/db.config';
import { createError, asyncHandler } from '../middleware/error.middleware';
import { z } from 'zod';

// Validation schemas
const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  program: z.string().optional(),
  yearLevel: z.number().int().min(1).max(5).optional(),
  gender: z.string().optional(),
  bio: z.string().max(500).optional(),
  instagramHandle: z.string().optional(),
  facebookProfile: z.string().optional(),
});

const updatePreferencesSchema = z.object({
  genderPreference: z.string().optional(),
  yearLevelPreference: z.array(z.number()).optional(),
  programPreference: z.array(z.string()).optional(),
  lookingFor: z.string().optional(),
});

export const userController = {
  getProfile: asyncHandler(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        studentId: true,
        program: true,
        yearLevel: true,
        gender: true,
        bio: true,
        profilePhotoUrl: true,
        instagramHandle: true,
        facebookProfile: true,
        surveyCompleted: true,
        preferences: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    res.json({
      success: true,
      data: user,
    });
  }),

  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    const validatedData = updateProfileSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: validatedData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        program: true,
        yearLevel: true,
        gender: true,
        bio: true,
        profilePhotoUrl: true,
        instagramHandle: true,
        facebookProfile: true,
      },
    });

    res.json({
      success: true,
      data: user,
      message: 'Profile updated successfully',
    });
  }),

  uploadPhoto: asyncHandler(async (req: Request, res: Response) => {
    // For now, we'll just accept a URL
    // In production, you'd handle file uploads to S3/Cloudinary
    const { photoUrl } = req.body;

    if (!photoUrl) {
      throw createError('Photo URL is required', 400);
    }

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { profilePhotoUrl: photoUrl },
      select: {
        id: true,
        profilePhotoUrl: true,
      },
    });

    res.json({
      success: true,
      data: user,
      message: 'Profile photo updated successfully',
    });
  }),

  updatePreferences: asyncHandler(async (req: Request, res: Response) => {
    const validatedData = updatePreferencesSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { preferences: validatedData },
      select: {
        id: true,
        preferences: true,
      },
    });

    res.json({
      success: true,
      data: user,
      message: 'Preferences updated successfully',
    });
  }),
};
