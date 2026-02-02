import { Request, Response } from 'express';
import { messageService } from '../services/message.service';
import { createError, asyncHandler } from '../middleware/error.middleware';
import { z } from 'zod';

// Validation schemas
const sendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
});

const markReadSchema = z.object({
  messageIds: z.array(z.string()).min(1),
});

export const messageController = {
  /**
   * Send a message
   * POST /api/messages/send
   */
  sendMessage: asyncHandler(async (req: Request, res: Response) => {
    const { matchId } = req.params;
    const { content } = sendMessageSchema.parse(req.body);

    const message = await messageService.sendMessage(matchId, req.user!.id, content);

    res.status(201).json({
      success: true,
      data: message,
      message: 'Message sent successfully',
    });
  }),

  /**
   * Get message thread for a match
   * GET /api/messages/:matchId
   */
  getMessages: asyncHandler(async (req: Request, res: Response) => {
    const { matchId } = req.params;

    const messages = await messageService.getMessages(matchId, req.user!.id);

    res.json({
      success: true,
      data: messages,
      count: messages.length,
    });
  }),

  /**
   * Mark messages as read
   * PUT /api/messages/read
   */
  markAsRead: asyncHandler(async (req: Request, res: Response) => {
    const { messageIds } = markReadSchema.parse(req.body);

    const count = await messageService.markAsRead(messageIds, req.user!.id);

    res.json({
      success: true,
      data: { markedCount: count },
      message: `Marked ${count} messages as read`,
    });
  }),

  /**
   * Get unread message count
   * GET /api/messages/unread-count
   */
  getUnreadCount: asyncHandler(async (req: Request, res: Response) => {
    const count = await messageService.getUnreadCount(req.user!.id);

    res.json({
      success: true,
      data: { unreadCount: count },
    });
  }),

  /**
   * Get all conversations
   * GET /api/messages/conversations
   */
  getConversations: asyncHandler(async (req: Request, res: Response) => {
    const conversations = await messageService.getConversations(req.user!.id);

    res.json({
      success: true,
      data: conversations,
      count: conversations.length,
    });
  }),

  /**
   * Unlock messaging for a campaign (admin)
   * POST /api/messages/unlock/:campaignId
   */
  unlockMessaging: asyncHandler(async (req: Request, res: Response) => {
    const { campaignId } = req.params;

    const count = await messageService.unlockMessagingForCampaign(campaignId);

    res.json({
      success: true,
      data: { unlockedCount: count },
      message: `Messaging unlocked for ${count} matches`,
    });
  }),
};
