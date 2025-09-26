import { Request, Response } from 'express';
import { z } from 'zod';
import { Department } from '../models/Department';
import { getPagination, buildMeta } from '../utils/paginate';

const departmentSchema = z.object({ name: z.string().min(1), description: z.string().optional() });

export async function createDepartment(req: Request, res: Response) {
  const payload = departmentSchema.parse(req.body);
  const dep = await Department.create(payload);
  res.status(201).json(dep);
}

export async function listDepartments(req: Request, res: Response) {
  const { page, limit, skip, sort } = getPagination(req);
  const [items, total] = await Promise.all([
    Department.find().sort(sort).skip(skip).limit(limit),
    Department.countDocuments(),
  ]);
  res.json({ data: items, meta: buildMeta(total, page, limit) });
}

export async function getDepartment(req: Request, res: Response) {
  const item = await Department.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Department not found' });
  res.json(item);
}

export async function updateDepartment(req: Request, res: Response) {
  const payload = departmentSchema.partial().parse(req.body);
  const item = await Department.findByIdAndUpdate(req.params.id, payload, { new: true });
  if (!item) return res.status(404).json({ message: 'Department not found' });
  res.json(item);
}

export async function deleteDepartment(req: Request, res: Response) {
  const item = await Department.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Department not found' });
  res.json({ message: 'Deleted' });
}
