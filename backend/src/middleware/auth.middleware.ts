import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.config';
import { prisma } from '../config/db.config';
import { createError } from './error.middleware';

interface JwtPayload {
  userId: string;
  email: string;
}

// Define a custom request type with our user shape
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

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

    // Verify JWT
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw createError('User not found or inactive', 401);
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    next(error);
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  // For now, we'll check if the email is from the admin domain
  // In production, you should have a proper role-based system
  const adminEmails = ['admin@mcl.edu.ph', 'perfectmatch@mcl.edu.ph'];

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
