import { Request, Response } from 'express';
import { z } from 'zod';
import { Attendance } from '../models/Attendance';
import { getPagination, buildMeta } from '../utils/paginate';
import { toDateOnly, parseISODate } from '../utils/date';

const schema = z.object({
  user: z.string(),
  att_date: z.string().datetime(),
  status: z.enum(['P', 'A', 'L', 'H']),
  check_in: z.string().datetime().optional(),
  check_out: z.string().datetime().optional(),
  hours_worked: z.number().nonnegative().optional(),
});

export async function createAttendance(req: Request, res: Response) {
  const payload = schema.parse(req.body);
  const item = await Attendance.create({ ...payload, att_date: toDateOnly(payload.att_date) } as any);
  res.status(201).json(item);
}

export async function listAttendance(req: Request, res: Response) {
  const { page, limit, skip, sort } = getPagination(req);
  const filter: any = {};
  if (req.query.userId) filter.user = req.query.userId;
  if (req.query.from || req.query.to) {
    const range: any = {};
    if (req.query.from) range.$gte = toDateOnly(req.query.from as string);
    if (req.query.to) range.$lte = toDateOnly(req.query.to as string);
    filter.att_date = range;
  }
  const [items, total] = await Promise.all([
    Attendance.find(filter).populate('user').sort(sort).skip(skip).limit(limit),
    Attendance.countDocuments(filter),
  ]);
  res.json({ data: items, meta: buildMeta(total, page, limit) });
}

export async function getAttendance(req: Request, res: Response) {
  const item = await Attendance.findById(req.params.id).populate('user');
  if (!item) return res.status(404).json({ message: 'Attendance not found' });
  res.json(item);
}

export async function updateAttendance(req: Request, res: Response) {
  const payload = schema.partial().parse(req.body);
  const update: any = { ...payload };
  if (payload.att_date) update.att_date = toDateOnly(payload.att_date);
  const item = await Attendance.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!item) return res.status(404).json({ message: 'Attendance not found' });
  res.json(item);
}

export async function deleteAttendance(req: Request, res: Response) {
  const item = await Attendance.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Attendance not found' });
  res.json({ message: 'Deleted' });
}

const checkSchema = z.object({ userId: z.string(), timestamp: z.string().datetime().optional() });

export async function checkIn(req: Request, res: Response) {
  const { userId, timestamp } = checkSchema.parse(req.body);
  const ts = timestamp ? parseISODate(timestamp) : new Date();
  const attDate = toDateOnly(ts);
  const item = await Attendance.findOneAndUpdate(
    { user: userId, att_date: attDate },
    { $setOnInsert: { status: 'P' }, $set: { check_in: ts } },
    { upsert: true, new: true }
  );
  res.json(item);
}

export async function checkOut(req: Request, res: Response) {
  const { userId, timestamp } = checkSchema.parse(req.body);
  const ts = timestamp ? parseISODate(timestamp) : new Date();
  const attDate = toDateOnly(ts);
  const item = await Attendance.findOne({ user: userId, att_date: attDate });
  if (!item) return res.status(404).json({ message: 'Attendance not found for today' });
  item.check_out = ts;
  if (item.check_in) {
    const ms = (item.check_out.getTime() - item.check_in.getTime()) / 1000 / 60 / 60;
    item.hours_worked = Math.max(0, Number(ms.toFixed(2)));
  }
  await item.save();
  res.json(item);
}
