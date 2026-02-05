import { Request, Response } from 'express';
import { prisma } from '../config/db.config';
import { createError, asyncHandler } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import { emailService } from '../services/email.service';
import { supabase } from '../config/supabase.config';

export const authController = {
  getSession: asyncHandler(async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('No token provided', 401);
    }

    const token = authHeader.substring(7);

    try {
      // Verify the Supabase token
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        logger.error('Supabase auth verification failed:', error);
        throw createError('Invalid token', 401);
      }

      // Check if user exists in our database
      let dbUser = await prisma.user.findUnique({
        where: { email: user.email! },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          program: true,
          yearLevel: true,
          surveyCompleted: true,
          profilePhotoUrl: true,
          bio: true,
        },
      });

      // If user doesn't exist in our database, create them
      if (!dbUser) {
        const emailLocal = user.email!.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
        const uniqueId = `${emailLocal.substring(0, 10)}${Math.floor(1000 + Math.random() * 9000)}`;

        try {
          dbUser = await prisma.user.create({
            data: {
              email: user.email!,
              studentId: uniqueId,
              firstName: user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')[0] || 'Wizard',
              lastName: user.user_metadata?.last_name || user.user_metadata?.full_name?.split(' ').slice(-1)[0] || 'User',
              program: 'Undeclared',
              yearLevel: 1,
            },
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              program: true,
              yearLevel: true,
              surveyCompleted: true,
              profilePhotoUrl: true,
              bio: true,
            },
          });

          // Send welcome email
          emailService.sendWelcomeEmail(dbUser.email, dbUser.firstName).catch((err) => {
            logger.error('Failed to send welcome email:', err);
          });

          logger.info('New user created via Supabase:', { email: dbUser.email, userId: dbUser.id });
        } catch (dbError: any) {
          // Fallback for unique constraint violation
          if (dbError.code === 'P2002') {
            const fallbackId = `${emailLocal.substring(0, 5)}${Date.now().toString().slice(-6)}`;
            dbUser = await prisma.user.create({
              data: {
                email: user.email!,
                studentId: fallbackId,
                firstName: user.user_metadata?.first_name || 'Wizard',
                lastName: user.user_metadata?.last_name || 'User',
                program: 'Undeclared',
                yearLevel: 1,
              },
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                program: true,
                yearLevel: true,
                surveyCompleted: true,
                profilePhotoUrl: true,
                bio: true,
              },
            });
            logger.info('New user created via Supabase (fallback ID):', { email: dbUser.email, userId: dbUser.id });
          } else {
            throw dbError;
          }
        }
      } else {
        // Update last login
        await prisma.user.update({
          where: { id: dbUser.id },
          data: { lastLogin: new Date() },
        });
      }

      res.json({
        success: true,
        data: dbUser,
      });
    } catch (error: any) {
      logger.error('Get session error:', error);
      if (error.message === 'Invalid token') {
        throw error;
      }
      throw createError('Failed to get session', 500);
    }
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    // Logout is handled client-side by Supabase
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }),
};
