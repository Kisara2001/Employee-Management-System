import { Request, Response } from 'express';
import { z } from 'zod';
import { PayrollRun } from '../models/PayrollRun';
import { getPagination, buildMeta } from '../utils/paginate';
import { generatePayroll } from '../services/payrollService';

const genSchema = z.object({ year: z.number().int(), month: z.number().int().min(1).max(12), userId: z.string().optional() });

export async function generate(req: Request, res: Response) {
  const payload = genSchema.parse(req.body);
  const runs = await generatePayroll(payload.year, payload.month, payload.userId);
  res.json({ generated: runs.length, runs });
}

export async function list(req: Request, res: Response) {
  const { page, limit, skip, sort } = getPagination(req);
  const filter: any = {};
  if (req.query.userId) filter.user = req.query.userId;
  if (req.query.year) filter.period_year = Number(req.query.year);
  if (req.query.month) filter.period_month = Number(req.query.month);
  const [items, total] = await Promise.all([
    PayrollRun.find(filter).populate('user').sort(sort).skip(skip).limit(limit),
    PayrollRun.countDocuments(filter),
  ]);
  res.json({ data: items, meta: buildMeta(total, page, limit) });
}

export async function getOne(req: Request, res: Response) {
  const item = await PayrollRun.findById(req.params.id).populate('user');
  if (!item) return res.status(404).json({ message: 'Payroll not found' });
  res.json(item);
}

const updateSchema = z.object({
  working_days: z.number().optional(),
  present_days: z.number().optional(),
  overtime_hours: z.number().optional(),
  basic_salary: z.number().optional(),
  total_allowances: z.number().optional(),
  total_deductions: z.number().optional(),
  gross_pay: z.number().optional(),
  net_pay: z.number().optional(),
  notes: z.string().optional(),
});

export async function update(req: Request, res: Response) {
  const payload = updateSchema.parse(req.body);
  const item = await PayrollRun.findByIdAndUpdate(req.params.id, payload, { new: true });
  if (!item) return res.status(404).json({ message: 'Payroll not found' });
  res.json(item);
}

export async function remove(req: Request, res: Response) {
  const item = await PayrollRun.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Payroll not found' });
  res.json({ message: 'Deleted' });
}
