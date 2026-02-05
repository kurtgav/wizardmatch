import { Request, Response } from 'express';
import { crushService } from '../services/crush.service';
import { campaignService } from '../services/campaign.service';
import { createError, asyncHandler } from '../middleware/error.middleware';
import { z } from 'zod';
import { isAdminEmail } from '../config/env.config';

// Validation schemas
const submitCrushListSchema = z.object({
  crushes: z.array(z.object({
    email: z.string().email(),
    name: z.string().optional(),
  })).max(2, 'Maximum 2 crushes allowed'),
});

export const crushController = {
  /**
   * Submit crush list
   * POST /api/crush-list
   */
  submitCrushList: asyncHandler(async (req: Request, res: Response) => {
    const { crushes } = submitCrushListSchema.parse(req.body);

    // Get active campaign
    const campaign = await campaignService.getActiveCampaign();
    if (!campaign) {
      throw createError('No active campaign', 400);
    }

    // Check if crush list submission is allowed
    const isAdmin = isAdminEmail(req.user!.email);

    const canSubmit = campaignService.isActionAllowed(campaign, 'submit_crush_list');
    if (!canSubmit && !isAdmin) {
      throw createError('Crush list submission is not currently allowed', 400);
    }

    const result = await crushService.submitCrushList(req.user!.id, campaign.id, crushes);

    res.json({
      success: true,
      data: result,
      message: result.mutualCount > 0
        ? `Crush list submitted! You have ${result.mutualCount} mutual crush${result.mutualCount > 1 ? 'es' : ''}! 💕`
        : 'Crush list submitted successfully!',
    });
  }),

  /**
   * Get user's crush list
   * GET /api/crush-list
   */
  getCrushList: asyncHandler(async (req: Request, res: Response) => {
    const campaign = await campaignService.getActiveCampaign();
    if (!campaign) {
      throw createError('No active campaign', 400);
    }

    const crushList = await crushService.getUserCrushList(req.user!.id, campaign.id);

    res.json({
      success: true,
      data: crushList,
      count: crushList.length,
    });
  }),

  /**
   * Get mutual crushes
   * GET /api/crush-list/mutual
   */
  getMutualCrushes: asyncHandler(async (req: Request, res: Response) => {
    const campaign = await campaignService.getActiveCampaign();
    if (!campaign) {
      throw createError('No active campaign', 400);
    }

    const mutualCrushes = await crushService.getMutualCrushes(req.user!.id, campaign.id);

    res.json({
      success: true,
      data: mutualCrushes,
      count: mutualCrushes.length,
    });
  }),

  /**
   * Get users who crushed on you
   * GET /api/crush-list/crushed-by
   */
  getCrushedBy: asyncHandler(async (req: Request, res: Response) => {
    const campaign = await campaignService.getActiveCampaign();
    if (!campaign) {
      throw createError('No active campaign', 400);
    }

    const crushedBy = await crushService.getCrushedByUsers(req.user!.id, campaign.id);

    // Don't reveal identities, just show count and anonymous info
    res.json({
      success: true,
      data: {
        count: crushedBy.length,
        hasCrushes: crushedBy.length > 0,
        // Only reveal after results are released
        revealIdentities: campaignService.getCampaignPhase(campaign) === 'results_released',
        crushedBy: campaignService.getCampaignPhase(campaign) === 'results_released'
          ? crushedBy
          : undefined,
      },
    });
  }),

  /**
   * Update crush list (before survey closes)
   * PUT /api/crush-list
   */
  updateCrushList: asyncHandler(async (req: Request, res: Response) => {
    const { crushes } = submitCrushListSchema.parse(req.body);

    // Get active campaign
    const campaign = await campaignService.getActiveCampaign();
    if (!campaign) {
      throw createError('No active campaign', 400);
    }

    // Check if crush list submission is still allowed
    const isAdmin = isAdminEmail(req.user!.email);

    const canSubmit = campaignService.isActionAllowed(campaign, 'submit_crush_list');
    if (!canSubmit && !isAdmin) {
      throw createError('Crush list updates are not currently allowed', 400);
    }

    const result = await crushService.submitCrushList(req.user!.id, campaign.id, crushes);

    res.json({
      success: true,
      data: result,
      message: 'Crush list updated successfully',
    });
  }),

  /**
   * Get all crushes for a campaign (admin)
   * GET /api/crush-list/admin/:campaignId
   */
  getCampaignCrushes: asyncHandler(async (req: Request, res: Response) => {
    const { campaignId } = req.params;

    const crushes = await crushService.getCampaignCrushes(campaignId);

    res.json({
      success: true,
      data: crushes,
      count: crushes.length,
    });
  }),
};
