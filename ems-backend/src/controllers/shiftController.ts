import { Request, Response } from 'express';
import { z } from 'zod';
import { Shift } from '../models/Shift';
import { getPagination, buildMeta } from '../utils/paginate';

const shiftSchema = z.object({
  name: z.string().min(1),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
  break_minutes: z.number().int().nonnegative(),
});

export async function createShift(req: Request, res: Response) {
  const payload = shiftSchema.parse(req.body);
  const item = await Shift.create(payload);
  res.status(201).json(item);
}

export async function listShifts(req: Request, res: Response) {
  const { page, limit, skip, sort } = getPagination(req);
  const [items, total] = await Promise.all([
    Shift.find().sort(sort).skip(skip).limit(limit),
    Shift.countDocuments(),
  ]);
  res.json({ data: items, meta: buildMeta(total, page, limit) });
}

export async function getShift(req: Request, res: Response) {
  const item = await Shift.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Shift not found' });
  res.json(item);
}

export async function updateShift(req: Request, res: Response) {
  const payload = shiftSchema.partial().parse(req.body);
  const item = await Shift.findByIdAndUpdate(req.params.id, payload, { new: true });
  if (!item) return res.status(404).json({ message: 'Shift not found' });
  res.json(item);
}

export async function deleteShift(req: Request, res: Response) {
  const item = await Shift.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Shift not found' });
  res.json({ message: 'Deleted' });
}
