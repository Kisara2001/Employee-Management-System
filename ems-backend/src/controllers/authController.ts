import { Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { signToken } from '../middleware/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function login(req: Request, res: Response) {
  const { email, password } = loginSchema.parse(req.body);
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await user.comparePassword(password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const token = signToken({ sub: String(user._id), role: user.role, email: user.email });
  res.json({ token, user: { id: user._id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role } });
}

export async function me(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const user = await User.findById(req.user.sub).select('-password_hash');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
}
