import { prisma } from '../config/db.config';
import { logger } from '../utils/logger';

export const CampaignPhase = {
  PRE_LAUNCH: 'pre_launch',
  SURVEY_OPEN: 'survey_open',
  SURVEY_CLOSED: 'survey_closed',
  PROFILE_UPDATE: 'profile_update',
  RESULTS_RELEASED: 'results_released',
} as const;

export type CampaignPhaseType = typeof CampaignPhase[keyof typeof CampaignPhase];

export interface CampaignConfig {
  weights?: {
    demographics?: number;
    personality?: number;
    values?: number;
    lifestyle?: number;
    interests?: number;
  };
  matchesPerUser?: number;
  minimumThreshold?: number;
}

export const campaignService = {
  /**
   * Get the active campaign
   */
  async getActiveCampaign(): Promise<any | null> {
    try {
      const campaign = await prisma.campaign.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });
      return campaign;
    } catch (error) {
      logger.error('Error getting active campaign:', error);
      throw error;
    }
  },

  /**
   * Get campaign by ID
   */
  async getCampaignById(campaignId: string): Promise<any | null> {
    try {
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
      });
      return campaign;
    } catch (error) {
      logger.error('Error getting campaign:', error);
      throw error;
    }
  },

  /**
   * Determine current phase of a campaign
   */
  getCampaignPhase(campaign: any): CampaignPhaseType {
    const now = new Date();

    if (now < campaign.surveyOpenDate) {
      return 'pre_launch';
    }
    if (now < campaign.surveyCloseDate) {
      return 'survey_open';
    }
    if (now < campaign.profileUpdateStartDate) {
      return 'survey_closed';
    }
    if (now < campaign.profileUpdateEndDate) {
      return 'profile_update';
    }
    return 'results_released';
  },

  /**
   * Check if a specific action is allowed based on campaign phase
   */
  isActionAllowed(campaign: any, action: string): boolean {
    const phase = this.getCampaignPhase(campaign);

    const permissions: Record<string, Record<string, boolean>> = {
      view_landing: {
        pre_launch: true,
        survey_open: true,
        survey_closed: true,
        profile_update: true,
        results_released: true,
      },
      sign_up: {
        pre_launch: false,
        survey_open: true,
        survey_closed: false,
        profile_update: false,
        results_released: false,
      },
      take_survey: {
        pre_launch: false,
        survey_open: true,
        survey_closed: false,
        profile_update: false,
        results_released: false,
      },
      edit_survey: {
        pre_launch: false,
        survey_open: true,
        survey_closed: false,
        profile_update: false,
        results_released: false,
      },
      submit_crush_list: {
        pre_launch: false,
        survey_open: true,
        survey_closed: false,
        profile_update: false,
        results_released: false,
      },
      edit_profile: {
        pre_launch: false,
        survey_open: true,
        survey_closed: false,
        profile_update: true, // Limited profile editing during this period
        results_released: false,
      },
      view_matches: {
        pre_launch: false,
        survey_open: false,
        survey_closed: false,
        profile_update: true, // Early access
        results_released: true,
      },
      send_messages: {
        pre_launch: false,
        survey_open: false,
        survey_closed: false,
        profile_update: true, // Only during Feb 11-13
        results_released: true, // Optional: keep messaging after reveal
      },
    };

    return permissions[action]?.[phase] ?? false;
  },

  /**
   * Create a new campaign
   */
  async createCampaign(data: {
    name: string;
    surveyOpenDate: Date;
    surveyCloseDate: Date;
    profileUpdateStartDate: Date;
    profileUpdateEndDate: Date;
    resultsReleaseDate: Date;
    config?: CampaignConfig;
  }): Promise<any> {
    try {
      const campaign = await prisma.campaign.create({
        data: {
          name: data.name,
          surveyOpenDate: data.surveyOpenDate,
          surveyCloseDate: data.surveyCloseDate,
          profileUpdateStartDate: data.profileUpdateStartDate,
          profileUpdateEndDate: data.profileUpdateEndDate,
          resultsReleaseDate: data.resultsReleaseDate,
          config: (data.config || {
            weights: {
              demographics: 0.10,
              personality: 0.30,
              values: 0.25,
              lifestyle: 0.20,
              interests: 0.15,
            },
            matchesPerUser: 7,
            minimumThreshold: 50,
          }) as any,
        },
      });

      logger.info(`Campaign created: ${campaign.id}`);
      return campaign;
    } catch (error) {
      logger.error('Error creating campaign:', error);
      throw error;
    }
  },

  /**
   * Update campaign
   */
  async updateCampaign(campaignId: string, data: Partial<any>): Promise<any> {
    try {
      const campaign = await prisma.campaign.update({
        where: { id: campaignId },
        data,
      });

      logger.info(`Campaign updated: ${campaignId}`);
      return campaign;
    } catch (error) {
      logger.error('Error updating campaign:', error);
      throw error;
    }
  },

  /**
   * Get campaign statistics
   */
  async getCampaignStats(campaignId: string): Promise<any> {
    try {
      const [totalParticipants, totalMatches, surveyCompletedCount] = await Promise.all([
        prisma.user.count({
          where: {
            surveyResponses: {
              some: { campaignId },
            },
          },
        }),
        prisma.match.count({
          where: { campaignId },
        }),
        prisma.user.count({
          where: {
            surveyCompleted: true,
            surveyResponses: {
              some: { campaignId },
            },
          },
        }),
      ]);

      // Get crush list stats
      const crushListCount = await prisma.crushList.count({
        where: { campaignId },
      });

      const mutualCrushCount = await prisma.crushList.count({
        where: { campaignId, isMutual: true },
      });

      // Get match tier distribution
      const matchesByTier = await prisma.match.groupBy({
        by: ['matchTier'],
        where: { campaignId },
        _count: true,
      });

      return {
        totalParticipants,
        totalMatches,
        surveyCompletedCount,
        crushListCount,
        mutualCrushCount,
        matchesByTier: matchesByTier.reduce((acc, item) => {
          if (item.matchTier) {
            acc[item.matchTier] = item._count;
          }
          return acc;
        }, {} as Record<string, number>),
      };
    } catch (error) {
      logger.error('Error getting campaign stats:', error);
      throw error;
    }
  },

  /**
   * Increment participant count
   */
  async incrementParticipants(campaignId: string): Promise<void> {
    try {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          totalParticipants: {
            increment: 1,
          },
        },
      });
    } catch (error) {
      logger.error('Error incrementing participants:', error);
      throw error;
    }
  },

  /**
   * Update match count
   */
  async updateMatchCount(campaignId: string, count: number): Promise<void> {
    try {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          totalMatchesGenerated: count,
        },
      });
    } catch (error) {
      logger.error('Error updating match count:', error);
      throw error;
    }
  },

  /**
   * Get time remaining until next phase
   */
  getTimeRemaining(campaign: any): { phase: string; timeRemaining: number; label: string } {
    const now = new Date();
    const phase = this.getCampaignPhase(campaign);

    let targetDate: Date;
    let label: string;

    switch (phase) {
      case 'pre_launch':
        targetDate = new Date(campaign.surveyOpenDate);
        label = 'Until survey opens';
        break;
      case 'survey_open':
        targetDate = new Date(campaign.surveyCloseDate);
        label = 'Until survey closes';
        break;
      case 'survey_closed':
        targetDate = new Date(campaign.profileUpdateStartDate);
        label = 'Until profile update period';
        break;
      case 'profile_update':
        targetDate = new Date(campaign.resultsReleaseDate);
        label = 'Until results reveal';
        break;
      case 'results_released':
        targetDate = new Date(campaign.resultsReleaseDate);
        label = 'Results revealed!';
        break;
      default:
        targetDate = new Date(campaign.resultsReleaseDate);
        label = 'Until results reveal';
    }

    const timeRemaining = Math.max(0, targetDate.getTime() - now.getTime());

    return {
      phase,
      timeRemaining,
      label,
    };
  },
};
