import { Request, Response } from 'express';
import { User } from '../models/user.model';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_local_dev';

function hashPassword(password: string): string {
  return crypto.createHash('sha512').update(password).digest('hex');
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== hashPassword(password)) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    //JWT expiring in 1 hour
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    return res.json({ token });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

export async function getUserInfo(req: AuthenticatedRequest, res: Response) {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error.' });
  }
}