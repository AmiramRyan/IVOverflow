import { Router } from 'express';
import { createAnswer, getAnswersForQuestion, voteAnswer, getVotes } from '../controllers/interaction.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/answer', requireAuth, createAnswer);
router.get('/answers/:questionId', requireAuth, getAnswersForQuestion);
router.post('/vote', requireAuth, voteAnswer);
router.get('/votes/:questionId', requireAuth, getVotes);

export default router;