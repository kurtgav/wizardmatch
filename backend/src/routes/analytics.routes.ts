import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';

const router = Router();

// Public analytics routes (no authentication required)
router.get('/overview', analyticsController.getOverview);
router.get('/participants', analyticsController.getParticipants);
router.get('/programs', analyticsController.getByProgram);
router.get('/year-levels', analyticsController.getByYearLevel);
router.get('/success-rate', analyticsController.getSuccessRate);

export default router;
