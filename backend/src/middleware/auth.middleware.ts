import { Request, Response, NextFunction } from 'express';
import { createError } from './error.middleware';
import { supabase } from '../config/supabase.config';
import { prisma } from '../config/db.config';
import { logger } from '../utils/logger';

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('Authentication required', 401);
    }

    const token = authHeader.substring(7);

    // Verify Supabase token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user || !user.email) {
      logger.error('Supabase auth verification failed:', error);
      throw createError('Invalid or expired token', 401);
    }

    // Get full user from our database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    // If user doesn't exist in our database, create them
    if (!dbUser) {
      const emailLocal = user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
      const uniqueId = `${emailLocal.substring(0, 10)}${Math.floor(1000 + Math.random() * 9000)}`;

      const newUser = await prisma.user.create({
        data: {
          email: user.email,
          studentId: uniqueId,
          firstName: user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')[0] || 'Wizard',
          lastName: user.user_metadata?.last_name || user.user_metadata?.full_name?.split(' ').slice(-1)[0] || 'User',
          program: 'Undeclared',
          yearLevel: 1,
        },
      });

      req.user = newUser;
    } else if (!dbUser.isActive) {
      throw createError('User account is inactive', 401);
    } else {
      req.user = dbUser;
    }

    next();
  } catch (error) {
    next(error);
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  const adminEmails = [
    'kurtgavin.design@gmail.com',
    'admin@wizardmatch.ai',
    process.env.ADMIN_EMAIL,
  ].filter(Boolean) as string[];

  if (!req.user) {
    return next(createError('Authentication required', 401));
  }

  if (!adminEmails.includes(req.user.email)) {
    return next(createError('Admin access required', 403));
  }

  next();
}

export function requireCompletedSurvey(_req: Request, _res: Response, next: NextFunction): void {
  // This middleware will be checked in the controller
  // where we have access to the full user object
  next();
}
