
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();

// One-time admin seed when no users exist (guarded by env ALLOW_SEED=true)
router.post('/seed-admin', async (req,res) => {
  try {
    if (process.env.ALLOW_SEED !== 'true') return res.status(403).json({message:'Seeding disabled'});
    const count = await User.countDocuments();
    if (count > 0) return res.status(400).json({ message: 'Users already exist' });
    const { email = 'admin@ems.local', password = 'admin123' } = req.body || {};
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash: hash, role: 'ADMIN' });
    res.json({ message: 'Admin created', email: user.email });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/register', async (req,res)=>{
  try {
    const { email, password, role = 'EMPLOYEE' } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash: hash, role });
    res.json({ id: user._id, email: user.email, role: user.role });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/login', async (req,res)=>{
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message:'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message:'Invalid credentials' });
    if (!user.isActive) return res.status(403).json({ message: 'User inactive' });
    const token = jwt.sign({ uid: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30m' });
    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
