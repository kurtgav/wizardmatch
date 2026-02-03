import { Router } from 'express';
import { authController } from '../controllers/auth.controller';

const router = Router();

// Google OAuth routes
router.get('/google', authController.googleOAuth);
router.get('/google/callback', authController.googleCallback);

// Session routes
router.get('/session', authController.getSession);
router.post('/logout', authController.logout);

// Dev login route
router.get('/dev-login', authController.devLogin);

export default router;
