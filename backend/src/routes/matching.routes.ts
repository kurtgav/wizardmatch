import { Router } from 'express';
import { matchingController } from '../controllers/matching.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All matching routes require authentication
router.use(authenticate);

// Potential matches (Tinder-style - show users you can pass/interest)
router.get('/potential', matchingController.getPotentialMatches);

// Existing matches
router.get('/', matchingController.getMatches);
router.get('/:matchId', matchingController.getMatchById);
router.post('/:matchId/reveal', matchingController.revealMatch);
router.post('/:matchId/interest', matchingController.markInterest);
router.post('/:matchId/report', matchingController.reportMatch);

// NEW: Pass/Interest on any user (Tinder-style)
router.post('/pass/:targetUserId', matchingController.passUser);
router.post('/interest/:targetUserId', matchingController.interestUser);

export default router;
