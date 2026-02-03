import { Router } from 'express';
import { campaignController } from '../controllers/campaign.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/active', campaignController.getActiveCampaign);
router.get('/active/check-action/:action', campaignController.checkActionAllowed);

// Protected routes
router.get('/active', authenticate, campaignController.getActiveCampaign);
router.get('/:id', authenticate, campaignController.getCampaignById);
router.get('/:id/stats', authenticate, campaignController.getCampaignStats);

// Admin routes - require authentication and admin role
router.get('/', authenticate, requireAdmin, campaignController.listCampaigns);
router.post('/', authenticate, requireAdmin, campaignController.createCampaign);
router.put('/:id', authenticate, requireAdmin, campaignController.updateCampaign);
router.delete('/:id', authenticate, requireAdmin, campaignController.deleteCampaign);

export default router;
