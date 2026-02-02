import { prisma } from '../config/db.config';
import { logger } from '../utils/logger';

export const crushService = {
  /**
   * Submit or update crush list for a user
   */
  async submitCrushList(userId: string, campaignId: string, crushes: Array<{ email: string; name?: string }>): Promise<any> {
    try {
      // Validate max 10 crushes
      if (crushes.length > 10) {
        throw new Error('Maximum 10 crushes allowed');
      }

      // Delete existing crushes for this user in this campaign
      await prisma.crushList.deleteMany({
        where: { userId, campaignId },
      });

      // Create new crush entries
      const crushEntries = await Promise.all(
        crushes.map(async (crush) => {
          // Check if the crush email exists in our system
          const crushUser = await prisma.user.findUnique({
            where: { email: crush.email.toLowerCase() },
            select: { id: true, firstName: true, lastName: true },
          });

          // Check if this is a mutual crush
          let isMutual = false;
          if (crushUser) {
            const existingCrush = await prisma.crushList.findFirst({
              where: {
                userId: crushUser.id,
                campaignId,
                crushEmail: { equals: crush.email.toLowerCase(), mode: 'insensitive' },
              },
            });

            if (existingCrush) {
              isMutual = true;
              // Update the existing crush to mark as mutual
              await prisma.crushList.update({
                where: { id: existingCrush.id },
                data: { isMutual: true },
              });
            }
          }

          return prisma.crushList.create({
            data: {
              userId,
              campaignId,
              crushEmail: crush.email.toLowerCase(),
              crushName: crush.name || (crushUser ? `${crushUser.firstName} ${crushUser.lastName}` : null),
              isMutual,
            },
          });
        })
      );

      logger.info(`Crush list submitted for user ${userId}, ${crushes.length} crushes`);

      // Count mutual crushes
      const mutualCount = crushEntries.filter((c) => c.isMutual).length;

      return {
        success: true,
        crushCount: crushes.length,
        mutualCount,
        crushes: crushEntries,
      };
    } catch (error) {
      logger.error('Error submitting crush list:', error);
      throw error;
    }
  },

  /**
   * Get user's crush list
   */
  async getUserCrushList(userId: string, campaignId: string): Promise<any[]> {
    try {
      const crushList = await prisma.crushList.findMany({
        where: { userId, campaignId },
        orderBy: { createdAt: 'asc' },
      });

      // Add crush user info if available
      const crushListWithInfo = await Promise.all(
        crushList.map(async (crush) => {
          const crushUser = await prisma.user.findUnique({
            where: { email: crush.crushEmail },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePhotoUrl: true,
              program: true,
              yearLevel: true,
            },
          });

          return {
            ...crush,
            crushUser,
            isRegistered: !!crushUser,
          };
        })
      );

      return crushListWithInfo;
    } catch (error) {
      logger.error('Error getting crush list:', error);
      throw error;
    }
  },

  /**
   * Get mutual crushes for a user
   */
  async getMutualCrushes(userId: string, campaignId: string): Promise<any[]> {
    try {
      const mutualCrushes = await prisma.crushList.findMany({
        where: { userId, campaignId, isMutual: true },
        orderBy: { createdAt: 'asc' },
      });

      return mutualCrushes;
    } catch (error) {
      logger.error('Error getting mutual crushes:', error);
      throw error;
    }
  },

  /**
   * Find users who listed this user as a crush
   */
  async getCrushedByUsers(userId: string, campaignId: string): Promise<any[]> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      if (!user) {
        return [];
      }

      const crushedBy = await prisma.crushList.findMany({
        where: {
          campaignId,
          crushEmail: user.email,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return crushedBy;
    } catch (error) {
      logger.error('Error getting crushed by users:', error);
      throw error;
    }
  },

  /**
   * Check if two users have a mutual crush
   */
  async isMutualCrush(user1Id: string, user2Id: string, campaignId: string): Promise<boolean> {
    try {
      const user1 = await prisma.user.findUnique({
        where: { id: user1Id },
        select: { email: true },
      });

      const user2 = await prisma.user.findUnique({
        where: { id: user2Id },
        select: { email: true },
      });

      if (!user1 || !user2) {
        return false;
      }

      // Check if user1 listed user2 AND user2 listed user1
      const [user1ListedUser2, user2ListedUser1] = await Promise.all([
        prisma.crushList.findFirst({
          where: { userId: user1Id, campaignId, crushEmail: user2.email },
        }),
        prisma.crushList.findFirst({
          where: { userId: user2Id, campaignId, crushEmail: user1.email },
        }),
      ]);

      return !!(user1ListedUser2 && user2ListedUser1);
    } catch (error) {
      logger.error('Error checking mutual crush:', error);
      throw error;
    }
  },

  /**
   * Get crush bonus for matching algorithm
   * Returns: 1.20 for mutual crush, 1.10 for one-way crush, 1.0 for no crush
   */
  async getCrushBonus(user1Id: string, user2Id: string, campaignId: string): Promise<number> {
    try {
      const isMutual = await this.isMutualCrush(user1Id, user2Id, campaignId);

      if (isMutual) {
        return 1.20; // 20% boost for mutual crush
      }

      // Check for one-way crush
      const user1 = await prisma.user.findUnique({
        where: { id: user1Id },
        select: { email: true },
      });

      const user2 = await prisma.user.findUnique({
        where: { id: user2Id },
        select: { email: true },
      });

      if (!user1 || !user2) {
        return 1.0;
      }

      const [user1ListedUser2, user2ListedUser1] = await Promise.all([
        prisma.crushList.findFirst({
          where: { userId: user1Id, campaignId, crushEmail: user2.email },
        }),
        prisma.crushList.findFirst({
          where: { userId: user2Id, campaignId, crushEmail: user1.email },
        }),
      ]);

      if (user1ListedUser2 || user2ListedUser1) {
        return 1.10; // 10% boost for one-way crush
      }

      return 1.0; // No crush bonus
    } catch (error) {
      logger.error('Error getting crush bonus:', error);
      return 1.0;
    }
  },

  /**
   * Send nudge email to users who were listed as crush
   */
  async sendCrushNudges(campaignId: string): Promise<number> {
    try {
      // Find all unique crush emails
      const crushLists = await prisma.crushList.findMany({
        where: {
          campaignId,
          nudgeSent: false,
        },
        distinct: ['crushEmail'],
      });

      let nudgesSent = 0;

      for (const crush of crushLists) {
        // Check if the crush email is registered
        const crushUser = await prisma.user.findUnique({
          where: { email: crush.crushEmail },
        });

        if (crushUser && !crushUser.surveyCompleted) {
          // TODO: Send nudge email
          // await emailService.sendCrushNudge(crushUser.email, campaignId);

          // Mark nudge as sent
          await prisma.crushList.updateMany({
            where: {
              campaignId,
              crushEmail: crush.crushEmail,
            },
            data: { nudgeSent: true },
          });

          nudgesSent++;
        }
      }

      logger.info(`Sent ${nudgesSent} crush nudges for campaign ${campaignId}`);
      return nudgesSent;
    } catch (error) {
      logger.error('Error sending crush nudges:', error);
      throw error;
    }
  },

  /**
   * Get all crushes for a campaign (admin)
   */
  async getCampaignCrushes(campaignId: string): Promise<any[]> {
    try {
      const crushes = await prisma.crushList.findMany({
        where: { campaignId },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { isMutual: 'desc' },
      });

      return crushes;
    } catch (error) {
      logger.error('Error getting campaign crushes:', error);
      throw error;
    }
  },
};
