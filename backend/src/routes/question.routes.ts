import { Router } from 'express';
import { createQuestion, getAllQuestions, getQuestionById } from '../controllers/question.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/', requireAuth, createQuestion);
router.get('/', requireAuth, getAllQuestions);
router.get('/:id', requireAuth, getQuestionById);

export default router;