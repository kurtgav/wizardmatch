import { prisma } from '../config/db.config';
import { logger } from '../utils/logger';
import { campaignService } from './campaign.service';

export const messageService = {
  /**
   * Send a message to a match
   */
  async sendMessage(matchId: string, senderId: string, content: string): Promise<any> {
    try {
      // Get the match to verify participants
      const match = await prisma.match.findUnique({
        where: { id: matchId },
        include: {
          user1: { select: { id: true } },
          user2: { select: { id: true } },
          campaign: true,
        },
      });

      if (!match) {
        throw new Error('Match not found');
      }

      // Verify sender is part of the match
      if (match.user1.id !== senderId && match.user2.id !== senderId) {
        throw new Error('You are not part of this match');
      }

      // Check if messaging is unlocked
      if (!match.messagingUnlocked) {
        throw new Error('Messaging is not yet available for this match');
      }

      // Determine recipient
      const recipientId = match.user1.id === senderId ? match.user2.id : match.user1.id;

      // Validate content
      if (!content || content.trim().length === 0) {
        throw new Error('Message content cannot be empty');
      }

      if (content.length > 2000) {
        throw new Error('Message content too long (max 2000 characters)');
      }

      // Create message
      const message = await prisma.message.create({
        data: {
          matchId,
          senderId,
          recipientId,
          content: content.trim(),
        },
      });

      logger.info(`Message sent from ${senderId} to ${recipientId} in match ${matchId}`);

      return message;
    } catch (error) {
      logger.error('Error sending message:', error);
      throw error;
    }
  },

  /**
   * Get message thread for a match
   */
  async getMessages(matchId: string, userId: string): Promise<any[]> {
    try {
      // Verify user is part of the match
      const match = await prisma.match.findUnique({
        where: { id: matchId },
        select: {
          user1Id: true,
          user2Id: true,
          messagingUnlocked: true,
        },
      });

      if (!match) {
        throw new Error('Match not found');
      }

      if (match.user1Id !== userId && match.user2Id !== userId) {
        throw new Error('You are not part of this match');
      }

      if (!match.messagingUnlocked) {
        throw new Error('Messaging is not yet available for this match');
      }

      // Get messages
      const messages = await prisma.message.findMany({
        where: { matchId },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePhotoUrl: true,
            },
          },
        },
        orderBy: { sentAt: 'asc' },
      });

      return messages;
    } catch (error) {
      logger.error('Error getting messages:', error);
      throw error;
    }
  },

  /**
   * Mark messages as read
   */
  async markAsRead(messageIds: string[], userId: string): Promise<number> {
    try {
      // Mark messages where user is the recipient
      const result = await prisma.message.updateMany({
        where: {
          id: { in: messageIds },
          recipientId: userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      logger.info(`Marked ${result.count} messages as read for user ${userId}`);
      return result.count;
    } catch (error) {
      logger.error('Error marking messages as read:', error);
      throw error;
    }
  },

  /**
   * Get unread message count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const count = await prisma.message.count({
        where: {
          recipientId: userId,
          isRead: false,
        },
      });

      return count;
    } catch (error) {
      logger.error('Error getting unread count:', error);
      throw error;
    }
  },

  /**
   * Get all conversations for a user (matches with messages)
   */
  async getConversations(userId: string): Promise<any[]> {
    try {
      // Get all matches where user is involved
      const matches = await prisma.match.findMany({
        where: {
          OR: [
            { user1Id: userId },
            { user2Id: userId },
          ],
          messagingUnlocked: true,
        },
        include: {
          // User 1 info
          user1: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePhotoUrl: true,
            },
          },
          // User 2 info
          user2: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePhotoUrl: true,
            },
          },
        },
      });

      // Get last message for each match
      const conversations = await Promise.all(
        matches.map(async (match) => {
          const lastMessage = await prisma.message.findFirst({
            where: { matchId: match.id },
            orderBy: { sentAt: 'desc' },
          });

          const unreadCount = await prisma.message.count({
            where: {
              matchId: match.id,
              recipientId: userId,
              isRead: false,
            },
          });

          const otherUser = match.user1Id === userId ? match.user2 : match.user1;

          return {
            matchId: match.id,
            match,
            otherUser,
            lastMessage,
            unreadCount,
          };
        })
      );

      // Sort by most recent message
      conversations.sort((a, b) => {
        const aTime = a.lastMessage?.sentAt?.getTime() || 0;
        const bTime = b.lastMessage?.sentAt?.getTime() || 0;
        return bTime - aTime;
      });

      return conversations;
    } catch (error) {
      logger.error('Error getting conversations:', error);
      throw error;
    }
  },

  /**
   * Unlock messaging for a campaign (during profile update period)
   */
  async unlockMessagingForCampaign(campaignId: string): Promise<number> {
    try {
      const result = await prisma.match.updateMany({
        where: { campaignId },
        data: { messagingUnlocked: true },
      });

      logger.info(`Unlocked messaging for ${result.count} matches in campaign ${campaignId}`);
      return result.count;
    } catch (error) {
      logger.error('Error unlocking messaging:', error);
      throw error;
    }
  },

  /**
   * Check if messaging is currently allowed
   */
  async isMessagingAllowed(campaignId: string): Promise<boolean> {
    try {
      const campaign = await campaignService.getCampaignById(campaignId);

      if (!campaign) {
        return false;
      }

      const phase = campaignService.getCampaignPhase(campaign);

      // Messaging allowed during profile update period (Feb 11-13) and after results
      return phase === 'profile_update' || phase === 'results_released';
    } catch (error) {
      logger.error('Error checking messaging permission:', error);
      return false;
    }
  },
};
