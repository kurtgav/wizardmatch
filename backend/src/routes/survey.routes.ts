import { Router } from 'express';
import { surveyController } from '../controllers/survey.controller';
import { authenticate } from '../middleware/auth.middleware';
import { surveyRateLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

// Public routes - no authentication required
router.get('/questions', surveyController.getQuestions);

// All other survey routes require authentication
router.use(authenticate);

router.post('/responses', surveyRateLimiter, surveyController.submitResponse);
router.get('/responses', surveyController.getResponses);
router.post('/complete', surveyController.completeSurvey);
router.get('/progress', surveyController.getProgress);

export default router;
