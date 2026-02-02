import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authRateLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

// Google OAuth routes
router.get('/google', authRateLimiter, authController.googleOAuth);
router.get('/google/callback', authRateLimiter, authController.googleCallback);

// Session routes
router.get('/session', authController.getSession);
router.post('/logout', authController.logout);

export default router;
