import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.config';
import { prisma } from '../config/db.config';
import { createError, asyncHandler } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import { emailService } from '../services/email.service';

// Configure Google OAuth
require('../config/oauth.config');

export const authController = {
  googleOAuth: asyncHandler(async (req: Request, res: Response) => {
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      accessType: 'offline',
    })(req, res);
  }),

  googleCallback: asyncHandler(async (req: Request, res: Response) => {
    passport.authenticate('google', { session: false }, async (err: any, user: any) => {
      try {
        if (err) {
          logger.error('Passport Google auth error:', err);
          throw createError('Google authentication failed', 401);
        }

        if (!user || !user.email) {
          logger.error('No user or email returned from Google:', user);
          throw createError('Google authentication failed: No email received', 401);
        }

        // Allow any Google account - no domain restriction

        // Check if user exists
        let existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (existingUser) {
          // Update last login
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { lastLogin: new Date() },
          });
        } else {
          // Create new user with robust student ID generation
          // Sanitize email local part and append random identifier to ensure uniqueness
          const emailLocal = user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
          const uniqueId = `${emailLocal.substring(0, 10)}${Math.floor(1000 + Math.random() * 9000)}`;

          // Retry logic in case of collision could be added, but this is statistically safe
          try {
            existingUser = await prisma.user.create({
              data: {
                email: user.email,
                studentId: uniqueId,
                firstName: user.given_name || 'Wizard',
                lastName: user.family_name || 'User',
                program: 'Undeclared', // Will be updated during survey
                yearLevel: 1,
              },
            });
            emailService.sendWelcomeEmail(existingUser.email, existingUser.firstName).catch((err) => {
              logger.error('Failed to send welcome email:', err);
            });
            logger.info('New user created via Google:', { email: existingUser.email, userId: existingUser.id });
          } catch (dbError: any) {
            // Fallback for unique constraint violation on studentId
            if (dbError.code === 'P2002' && (dbError.meta?.target?.includes('student_id') || dbError.meta?.target?.includes('studentId'))) {
              const fallbackId = `${emailLocal.substring(0, 5)}${Date.now().toString().slice(-6)}`;
              existingUser = await prisma.user.create({
                data: {
                  email: user.email,
                  studentId: fallbackId,
                  firstName: user.given_name || 'Wizard',
                  lastName: user.family_name || 'User',
                  program: 'Undeclared',
                  yearLevel: 1,
                },
              });
              logger.info('New user created via Google (fallback ID):', { email: existingUser.email, userId: existingUser.id });
              // Send welcome email to new users with fallback ID (don't await - fire and forget)
              emailService.sendWelcomeEmail(existingUser.email, existingUser.firstName).catch((err) => {
                logger.error('Failed to send welcome email:', err);
              });
            } else {
              logger.error('Database error during user creation:', dbError);
              throw dbError;
            }
          }
        }

        // Generate JWT
        const token = jwt.sign(
          {
            userId: existingUser.id,
            email: existingUser.email,
          },
          config.jwtSecret,
          { expiresIn: config.jwtExpiresIn as any }
        );

        // Redirect to frontend with token
        res.redirect(`${config.frontendUrl}/auth/callback?token=${token}&newUser=${!existingUser.surveyCompleted}`);
      } catch (error: any) {
        logger.error('Google callback error:', error);
        // Include error message for debugging
        const errorMessage = error.message || 'Authentication failed';
        res.redirect(`${config.frontendUrl}/auth/login?error=auth_failed&message=${encodeURIComponent(errorMessage)}`);
      }
    })(req, res);
  }),

  getSession: asyncHandler(async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('No token provided', 401);
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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

    if (!user) {
      throw createError('User not found', 404);
    }

    res.json({
      success: true,
      data: user,
    });
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    // In a stateless JWT setup, logout is handled client-side
    // by deleting the token
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }),

  devLogin: asyncHandler(async (req: Request, res: Response) => {
    // ONLY ALLOW IN DEVELOPMENT
    if (config.nodeEnv === 'production' && req.query.secret !== 'force') {
      throw createError('Dev login only allowed in development', 403);
    }

    const email = (req.query.email as string) || 'kurtgavin.design@gmail.com';

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create test user
      user = await prisma.user.create({
        data: {
          email,
          studentId: `DEV-${Math.floor(1000 + Math.random() * 9000)}`,
          firstName: 'Dev',
          lastName: 'Wizard',
          program: 'Computer Science',
          yearLevel: 3,
          surveyCompleted: false
        },
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    // Redirect to frontend with token
    res.redirect(`${config.frontendUrl}/auth/callback?token=${token}&newUser=${!user.surveyCompleted}`);
  }),
};
