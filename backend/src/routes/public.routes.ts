import { Router } from 'express';
import { publicController } from '../controllers/public.controller';

const router = Router();

// Public routes - no authentication required
router.get('/stats', publicController.getPublicStats);

export default router;
