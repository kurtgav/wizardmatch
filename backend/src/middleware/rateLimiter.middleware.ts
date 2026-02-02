import rateLimit from 'express-rate-limit';
import { config } from '../config/env.config';

export const rateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks and auth routes
    if (req.path === '/health') return true;
    if (req.path?.startsWith('/api/auth')) return true;
    if (req.path?.startsWith('/api/public')) return true;
    if (req.path?.startsWith('/api/survey/questions')) return true;
    return false;
  },
});

// Very lenient rate limiter for authentication routes
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window (very lenient)
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
  skipSuccessfulRequests: false,
});

// Lenient rate limiter for survey submission
export const surveyRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 submissions per hour (very lenient)
  message: {
    success: false,
    error: 'Too many survey submissions, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
