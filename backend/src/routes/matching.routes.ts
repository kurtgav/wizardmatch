import { Router } from 'express';
import { matchingController } from '../controllers/matching.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All matching routes require authentication
router.use(authenticate);

// Match routes
router.get('/', matchingController.getMatches);
router.get('/:matchId', matchingController.getMatchById);
router.post('/:matchId/reveal', matchingController.revealMatch);
router.post('/:matchId/interest', matchingController.markInterest);
router.post('/:matchId/report', matchingController.reportMatch);

export default router;
