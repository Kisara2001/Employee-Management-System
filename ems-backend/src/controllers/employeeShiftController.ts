import { Request, Response } from 'express';
import { z } from 'zod';
import { EmployeeShift } from '../models/EmployeeShift';
import { getPagination, buildMeta } from '../utils/paginate';

const schema = z.object({
  user: z.string(),
  shift: z.string(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime().optional(),
});

export async function createEmployeeShift(req: Request, res: Response) {
  const payload = schema.parse(req.body);
  const item = await EmployeeShift.create(payload as any);
  res.status(201).json(item);
}

export async function listEmployeeShifts(req: Request, res: Response) {
  const { page, limit, skip, sort } = getPagination(req);
  const [items, total] = await Promise.all([
    EmployeeShift.find().populate('user shift').sort(sort).skip(skip).limit(limit),
    EmployeeShift.countDocuments(),
  ]);
  res.json({ data: items, meta: buildMeta(total, page, limit) });
}

export async function getEmployeeShift(req: Request, res: Response) {
  const item = await EmployeeShift.findById(req.params.id).populate('user shift');
  if (!item) return res.status(404).json({ message: 'EmployeeShift not found' });
  res.json(item);
}

export async function updateEmployeeShift(req: Request, res: Response) {
  const payload = schema.partial().parse(req.body);
  const item = await EmployeeShift.findByIdAndUpdate(req.params.id, payload, { new: true });
  if (!item) return res.status(404).json({ message: 'EmployeeShift not found' });
  res.json(item);
}

export async function deleteEmployeeShift(req: Request, res: Response) {
  const item = await EmployeeShift.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'EmployeeShift not found' });
  res.json({ message: 'Deleted' });
}
