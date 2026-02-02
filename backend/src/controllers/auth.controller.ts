import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.config';
import { prisma } from '../config/db.config';
import { createError, asyncHandler } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

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
        if (err || !user) {
          throw createError('Google authentication failed', 401);
        }

        // No email domain restriction - allow any personal Google account
        // Student ID will be collected during survey

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
          // Create new user
          existingUser = await prisma.user.create({
            data: {
              email: user.email,
              studentId: user.email.split('@')[0], // Use email username as student ID for now
              firstName: user.given_name || 'Wizard',
              lastName: user.family_name || 'User',
              program: 'Undeclared', // Will be updated during survey
              yearLevel: 1,
            },
          });
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
      } catch (error) {
        logger.error('Google callback error:', error);
        res.redirect(`${config.frontendUrl}/login?error=auth_failed`);
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
};
