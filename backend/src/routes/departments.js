
import { Router } from 'express';
import Department from '../models/Department.js';
import { requireAuth, allow } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, allow('ADMIN','HR','MANAGER'), async (req,res)=>{
  const list = await Department.find().sort({ name: 1 });
  res.json(list);
});

router.post('/', requireAuth, allow('ADMIN','HR'), async (req,res)=>{
  const dep = await Department.create(req.body);
  res.json(dep);
});

router.patch('/:id', requireAuth, allow('ADMIN','HR'), async (req,res)=>{
  const dep = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!dep) return res.status(404).json({ message: 'Not found' });
  res.json(dep);
});

router.delete('/:id', requireAuth, allow('ADMIN'), async (req,res)=>{
  await Department.findByIdAndDelete(req.params.id);
  res.json({ deleted: true });
});

export default router;
