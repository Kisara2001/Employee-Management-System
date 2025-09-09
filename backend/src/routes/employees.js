
import { Router } from 'express';
import Employee from '../models/Employee.js';
import { requireAuth, allow } from '../middleware/auth.js';

const router = Router();

// List with filters
router.get('/', requireAuth, allow('ADMIN','HR','MANAGER'), async (req,res)=>{
  const { q, dept, status, page = 1, size = 20 } = req.query;
  const filter = {};
  if (dept) filter.departmentId = dept;
  if (status) filter.status = status;
  const skip = (Number(page)-1) * Number(size);
  const findQuery = q ? { $text: { $search: q } } : filter;
  const [items, total] = await Promise.all([
    Employee.find(findQuery).skip(skip).limit(Number(size)).sort({ createdAt: -1 }),
    Employee.countDocuments(findQuery)
  ]);
  res.json({ items, total, page: Number(page), size: Number(size) });
});

// Create
router.post('/', requireAuth, allow('ADMIN','HR'), async (req,res)=>{
  const payload = req.body;
  const emp = await Employee.create(payload);
  res.json(emp);
});

// Read one
router.get('/:id', requireAuth, allow('ADMIN','HR','MANAGER'), async (req,res)=>{
  const emp = await Employee.findById(req.params.id);
  if (!emp) return res.status(404).json({ message: 'Not found' });
  res.json(emp);
});

// Update
router.patch('/:id', requireAuth, allow('ADMIN','HR'), async (req,res)=>{
  const emp = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!emp) return res.status(404).json({ message: 'Not found' });
  res.json(emp);
});

// Delete
router.delete('/:id', requireAuth, allow('ADMIN'), async (req,res)=>{
  const ok = await Employee.findByIdAndDelete(req.params.id);
  res.json({ deleted: !!ok });
});

export default router;
