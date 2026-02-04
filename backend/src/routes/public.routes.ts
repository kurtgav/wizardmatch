import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';

const router = Router();

// Public testimonial submission (no authentication required)
router.post('/testimonials', adminController.createTestimonial);

// Public testimonials
router.get('/testimonials', adminController.getPublishedTestimonials);

// Public stats
router.get('/stats', adminController.getPublicStats);

export default router;
