import { Request, Response } from 'express';
import { z } from 'zod';
import { SalaryTemplate } from '../models/SalaryTemplate';
import { getPagination, buildMeta } from '../utils/paginate';

const schema = z.object({
  user: z.string(),
  basic_salary: z.number().nonnegative(),
  allowance_fixed: z.number().nonnegative().optional().default(0),
  allowance_percent: z.number().nonnegative().optional().default(0),
  deduction_fixed: z.number().nonnegative().optional().default(0),
  deduction_percent: z.number().nonnegative().optional().default(0),
  effective_from: z.string().datetime(),
});

export async function upsertTemplate(req: Request, res: Response) {
  const payload = schema.parse(req.body);
  const item = await SalaryTemplate.findOneAndUpdate(
    { user: payload.user },
    payload as any,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.json(item);
}

export async function listTemplates(req: Request, res: Response) {
  const { page, limit, skip, sort } = getPagination(req);
  const filter: any = {};
  if (req.query.userId) filter.user = req.query.userId;
  const [items, total] = await Promise.all([
    SalaryTemplate.find(filter).populate('user').sort(sort).skip(skip).limit(limit),
    SalaryTemplate.countDocuments(filter),
  ]);
  res.json({ data: items, meta: buildMeta(total, page, limit) });
}

export async function getTemplateByUser(req: Request, res: Response) {
  const item = await SalaryTemplate.findOne({ user: req.params.userId }).populate('user');
  if (!item) return res.status(404).json({ message: 'Template not found' });
  res.json(item);
}

export async function deleteTemplate(req: Request, res: Response) {
  const item = await SalaryTemplate.findOneAndDelete({ user: req.params.userId });
  if (!item) return res.status(404).json({ message: 'Template not found' });
  res.json({ message: 'Deleted' });
}
