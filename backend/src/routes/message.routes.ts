import { Router } from 'express';
import { messageController } from '../controllers/message.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/conversations', messageController.getConversations);
router.get('/unread-count', messageController.getUnreadCount);
router.get('/:matchId', messageController.getMessages);
router.post('/send/:matchId', messageController.sendMessage);
router.put('/read', messageController.markAsRead);

// Admin route
router.post('/unlock/:campaignId', messageController.unlockMessaging);

export default router;
