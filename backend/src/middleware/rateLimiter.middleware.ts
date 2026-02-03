import rateLimit from 'express-rate-limit';
import { config } from '../config/env.config';

export const rateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.nodeEnv === 'development' ? 10000 : config.rateLimitMaxRequests,
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (config.nodeEnv === 'development') return true;

    // Skip rate limiting for health checks and auth routes
    const path = req.path || '';
    if (path === '/health') return true;
    if (path.startsWith('/api/auth') || path.startsWith('/auth')) return true;
    if (path.startsWith('/api/public') || path.startsWith('/public')) return true;
    if (path.startsWith('/api/survey/questions') || path.startsWith('/survey/questions')) return true;
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
