import { Router } from 'express';
import { crushController } from '../controllers/crush.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', crushController.submitCrushList);
router.get('/', crushController.getCrushList);
router.put('/', crushController.updateCrushList);
router.get('/mutual', crushController.getMutualCrushes);
router.get('/crushed-by', crushController.getCrushedBy);

// Admin route
router.get('/admin/:campaignId', crushController.getCampaignCrushes);

export default router;
