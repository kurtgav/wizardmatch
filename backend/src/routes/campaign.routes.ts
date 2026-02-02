import { Router } from 'express';
import { campaignController } from '../controllers/campaign.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/active', campaignController.getActiveCampaign);
router.get('/active/check-action/:action', campaignController.checkActionAllowed);

// Protected routes
router.get('/active', authenticate, campaignController.getActiveCampaign);
router.get('/:id', authenticate, campaignController.getCampaignById);
router.get('/:id/stats', authenticate, campaignController.getCampaignStats);

// Admin routes (TODO: Add admin middleware)
router.get('/', campaignController.listCampaigns);
router.post('/', campaignController.createCampaign);
router.put('/:id', campaignController.updateCampaign);
router.delete('/:id', campaignController.deleteCampaign);

export default router;
