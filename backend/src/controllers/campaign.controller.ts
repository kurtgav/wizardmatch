import { Request, Response } from 'express';
import { campaignService } from '../services/campaign.service';
import { prisma } from '../config/db.config';
import { createError, asyncHandler } from '../middleware/error.middleware';
import { z } from 'zod';

// Validation schemas
const createCampaignSchema = z.object({
  name: z.string().min(1).max(255),
  surveyOpenDate: z.string().datetime(),
  surveyCloseDate: z.string().datetime(),
  profileUpdateStartDate: z.string().datetime(),
  profileUpdateEndDate: z.string().datetime(),
  resultsReleaseDate: z.string().datetime(),
  config: z.object({
    weights: z.object({
      demographics: z.number().optional(),
      personality: z.number().optional(),
      values: z.number().optional(),
      lifestyle: z.number().optional(),
      interests: z.number().optional(),
    }).optional(),
    matchesPerUser: z.number().optional(),
    minimumThreshold: z.number().optional(),
  }).optional(),
});

const updateCampaignSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  isActive: z.boolean().optional(),
  surveyOpenDate: z.string().datetime().optional(),
  surveyCloseDate: z.string().datetime().optional(),
  profileUpdateStartDate: z.string().datetime().optional(),
  profileUpdateEndDate: z.string().datetime().optional(),
  resultsReleaseDate: z.string().datetime().optional(),
  config: z.object({
    weights: z.object({
      demographics: z.number().optional(),
      personality: z.number().optional(),
      values: z.number().optional(),
      lifestyle: z.number().optional(),
      interests: z.number().optional(),
    }).optional(),
    matchesPerUser: z.number().optional(),
    minimumThreshold: z.number().optional(),
  }).optional(),
});

export const campaignController = {
  /**
   * Get active campaign
   * GET /api/campaigns/active
   */
  getActiveCampaign: asyncHandler(async (req: Request, res: Response) => {
    const campaign = await campaignService.getActiveCampaign();

    if (!campaign) {
      throw createError('No active campaign found', 404);
    }

    // Add phase and time remaining info
    const phase = campaignService.getCampaignPhase(campaign);
    const timeInfo = campaignService.getTimeRemaining(campaign);

    res.json({
      success: true,
      data: {
        ...campaign,
        phase,
        timeRemaining: timeInfo.timeRemaining,
        nextPhaseLabel: timeInfo.label,
      },
    });
  }),

  /**
   * Get campaign by ID
   * GET /api/campaigns/:id
   */
  getCampaignById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const campaign = await campaignService.getCampaignById(id);

    if (!campaign) {
      throw createError('Campaign not found', 404);
    }

    // Add phase and time remaining info
    const phase = campaignService.getCampaignPhase(campaign);
    const timeInfo = campaignService.getTimeRemaining(campaign);

    res.json({
      success: true,
      data: {
        ...campaign,
        phase,
        timeRemaining: timeInfo.timeRemaining,
        nextPhaseLabel: timeInfo.label,
      },
    });
  }),

  /**
   * Get campaign statistics
   * GET /api/campaigns/:id/stats
   */
  getCampaignStats: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const campaign = await campaignService.getCampaignById(id);

    if (!campaign) {
      throw createError('Campaign not found', 404);
    }

    const stats = await campaignService.getCampaignStats(id);

    res.json({
      success: true,
      data: {
        campaign: {
          id: campaign.id,
          name: campaign.name,
          ...stats,
        },
      },
    });
  }),

  /**
   * Create new campaign (admin only)
   * POST /api/campaigns
   */
  createCampaign: asyncHandler(async (req: Request, res: Response) => {
    const data = createCampaignSchema.parse(req.body);

    const campaign = await campaignService.createCampaign({
      name: data.name,
      surveyOpenDate: new Date(data.surveyOpenDate),
      surveyCloseDate: new Date(data.surveyCloseDate),
      profileUpdateStartDate: new Date(data.profileUpdateStartDate),
      profileUpdateEndDate: new Date(data.profileUpdateEndDate),
      resultsReleaseDate: new Date(data.resultsReleaseDate),
      config: data.config,
    });

    res.status(201).json({
      success: true,
      data: campaign,
      message: 'Campaign created successfully',
    });
  }),

  /**
   * Update campaign (admin only)
   * PUT /api/campaigns/:id
   */
  updateCampaign: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = updateCampaignSchema.parse(req.body);

    // Convert date strings to Date objects
    const updateData: any = { ...data };
    if (data.surveyOpenDate) updateData.surveyOpenDate = new Date(data.surveyOpenDate);
    if (data.surveyCloseDate) updateData.surveyCloseDate = new Date(data.surveyCloseDate);
    if (data.profileUpdateStartDate) updateData.profileUpdateStartDate = new Date(data.profileUpdateStartDate);
    if (data.profileUpdateEndDate) updateData.profileUpdateEndDate = new Date(data.profileUpdateEndDate);
    if (data.resultsReleaseDate) updateData.resultsReleaseDate = new Date(data.resultsReleaseDate);

    const campaign = await campaignService.updateCampaign(id, updateData);

    res.json({
      success: true,
      data: campaign,
      message: 'Campaign updated successfully',
    });
  }),

  /**
   * Check if action is allowed
   * GET /api/campaigns/active/check-action/:action
   */
  checkActionAllowed: asyncHandler(async (req: Request, res: Response) => {
    const { action } = req.params;

    const campaign = await campaignService.getActiveCampaign();

    if (!campaign) {
      return res.json({
        success: true,
        data: {
          allowed: false,
          reason: 'No active campaign',
        },
      });
    }

    const allowed = campaignService.isActionAllowed(campaign, action);
    const phase = campaignService.getCampaignPhase(campaign);

    res.json({
      success: true,
      data: {
        allowed,
        phase,
        action,
      },
    });
  }),

  /**
   * List all campaigns (admin only)
   * GET /api/campaigns
   */
  listCampaigns: asyncHandler(async (req: Request, res: Response) => {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: campaigns,
      count: campaigns.length,
    });
  }),

  /**
   * Delete campaign (admin only)
   * DELETE /api/campaigns/:id
   */
  deleteCampaign: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    await prisma.campaign.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Campaign deleted successfully',
    });
  }),
};
