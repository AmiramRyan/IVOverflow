import { Router } from 'express';
import { login, getUserInfo } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', login);
router.get('/userInfo', requireAuth, getUserInfo);

export default router;