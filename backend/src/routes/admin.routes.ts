import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// All admin routes require authentication and admin access
router.use(authenticate);
router.use(requireAdmin);

// Dashboard stats
router.get('/stats', adminController.getStats);

// User management
router.get('/users', adminController.getUsers);
router.put('/users/:userId', adminController.updateUser);
router.delete('/users/:userId', adminController.deleteUser);

// Survey management
router.post('/questions', adminController.createQuestion);
router.put('/questions/:questionId', adminController.updateQuestion);
router.delete('/questions/:questionId', adminController.deleteQuestion);

// Match management
router.post('/generate-matches', adminController.generateMatches);
router.get('/matches', adminController.getAllMatches);
router.post('/manual-match', adminController.createManualMatch);
router.get('/eligible-users', adminController.getEligibleUsers);
router.delete('/matches/:matchId', adminController.deleteMatch);

// Settings
router.put('/settings', adminController.updateSettings);

// Testimonials
router.get('/testimonials', adminController.getTestimonials);
router.put('/testimonials/:testimonialId', adminController.approveTestimonial);

export default router;
