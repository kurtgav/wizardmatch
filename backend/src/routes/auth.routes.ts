import { Router } from 'express';
import { authController } from '../controllers/auth.controller';

const router = Router();

// Session routes (Supabase tokens)
router.get('/session', authController.getSession);
router.post('/logout', authController.logout);

export default router;
