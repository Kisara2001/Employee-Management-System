import { Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { getPagination, buildMeta } from '../utils/paginate';
import bcrypt from 'bcryptjs';

const createUserSchema = z.object({
  employee_code: z.string().min(1),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  hire_date: z.string().datetime().optional(),
  employment_status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED']).optional(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'EMPLOYEE']).optional(),
});

const updateUserSchema = createUserSchema.partial().extend({ password: z.string().min(6).optional() });

export async function createUser(req: Request, res: Response) {
  const payload = createUserSchema.parse(req.body);
  const password_hash = await bcrypt.hash(payload.password, 10);
  const user = await User.create({ ...payload, password_hash });
  res.status(201).json(user);
}

export async function listUsers(req: Request, res: Response) {
  const { page, limit, skip, sort } = getPagination(req);
  const { departmentId, designationId, status, q } = req.query as Record<string, string>;
  const filter: any = {};
  if (departmentId) filter.department = departmentId;
  if (designationId) filter.designation = designationId;
  if (status) filter.employment_status = status;
  if (q) {
    filter.$or = [
      { first_name: { $regex: q, $options: 'i' } },
      { last_name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
      { employee_code: { $regex: q, $options: 'i' } },
    ];
  }
  const [items, total] = await Promise.all([
    User.find(filter).populate('department designation').sort(sort).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  res.json({ data: items, meta: buildMeta(total, page, limit) });
}

export async function getUser(req: Request, res: Response) {
  const user = await User.findById(req.params.id).populate('department designation');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
}

export async function updateUser(req: Request, res: Response) {
  const payload = updateUserSchema.parse(req.body);
  const update: any = { ...payload };
  if (payload.password) {
    update.password_hash = await bcrypt.hash(payload.password, 10);
    delete update.password;
  }
  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
}

export async function deleteUser(req: Request, res: Response) {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { employment_status: 'INACTIVE' },
    { new: true }
  );
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'User set to INACTIVE', user });
}
