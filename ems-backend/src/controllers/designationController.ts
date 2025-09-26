import { Request, Response } from 'express';
import { z } from 'zod';
import { Designation } from '../models/Designation';
import { getPagination, buildMeta } from '../utils/paginate';

const designationSchema = z.object({
  department: z.string(),
  title: z.string().min(1),
  level: z.string().optional(),
});

export async function createDesignation(req: Request, res: Response) {
  const payload = designationSchema.parse(req.body);
  const item = await Designation.create(payload as any);
  res.status(201).json(item);
}

export async function listDesignations(req: Request, res: Response) {
  const { page, limit, skip, sort } = getPagination(req);
  const { departmentId } = req.query as Record<string, string>;
  const filter: any = {};
  if (departmentId) filter.department = departmentId;
  const [items, total] = await Promise.all([
    Designation.find(filter).populate('department').sort(sort).skip(skip).limit(limit),
    Designation.countDocuments(filter),
  ]);
  res.json({ data: items, meta: buildMeta(total, page, limit) });
}

export async function getDesignation(req: Request, res: Response) {
  const item = await Designation.findById(req.params.id).populate('department');
  if (!item) return res.status(404).json({ message: 'Designation not found' });
  res.json(item);
}

export async function updateDesignation(req: Request, res: Response) {
  const payload = designationSchema.partial().parse(req.body);
  const item = await Designation.findByIdAndUpdate(req.params.id, payload, { new: true });
  if (!item) return res.status(404).json({ message: 'Designation not found' });
  res.json(item);
}

export async function deleteDesignation(req: Request, res: Response) {
  const item = await Designation.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Designation not found' });
  res.json({ message: 'Deleted' });
}
