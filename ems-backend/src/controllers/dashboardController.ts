import { Request, Response } from 'express';
import { User } from '../models/User';
import { Attendance } from '../models/Attendance';
import { PayrollRun } from '../models/PayrollRun';
import { startOfMonth, endOfMonth } from '../utils/date';

export async function kpis(req: Request, res: Response) {
  const date = req.query.date ? new Date(req.query.date as string) : new Date();
  const day = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const [active, presentToday] = await Promise.all([
    User.countDocuments({ employment_status: 'ACTIVE' }),
    Attendance.countDocuments({ att_date: day, status: 'P' }),
  ]);
  res.json({ totalActiveEmployees: active, presentToday });
}

export async function attendanceTrend(req: Request, res: Response) {
  const from = new Date(req.query.from as string);
  const to = new Date(req.query.to as string);
  const data: { x: string; y: number }[] = [];
  for (let d = new Date(from); d <= to; d.setUTCDate(d.getUTCDate() + 1)) {
    const day = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const count = await Attendance.countDocuments({ att_date: day, status: 'P' });
    data.push({ x: day.toISOString().substring(0, 10), y: count });
  }
  res.json({ series: data });
}

export async function attendanceBreakdown(req: Request, res: Response) {
  const date = new Date(req.query.date as string);
  const day = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const agg = await Attendance.aggregate([
    { $match: { att_date: day } },
    { $group: { _id: '$status', value: { $sum: 1 } } },
  ]);
  res.json({ breakdown: agg.map((i) => ({ label: i._id, value: i.value })) });
}

export async function shiftsCoverage(req: Request, res: Response) {
  // Placeholder: reuse reports if needed
  res.json({ coverage: [] });
}

export async function departmentsHeadcount(_req: Request, res: Response) {
  const agg = await User.aggregate([
    { $group: { _id: '$department', value: { $sum: 1 } } },
  ]);
  res.json({ breakdown: agg.map((i) => ({ label: String(i._id || 'Unassigned'), value: i.value })) });
}

export async function overtimeTop(_req: Request, res: Response) {
  res.json({ data: [] });
}

export async function attendanceLate(_req: Request, res: Response) {
  res.json({ data: [] });
}

export async function payrollTrend(req: Request, res: Response) {
  const year = Number(req.query.year);
  const data: { x: string; y: number }[] = [];
  for (let m = 1; m <= 12; m++) {
    const sum = await PayrollRun.aggregate([
      { $match: { period_year: year, period_month: m } },
      { $group: { _id: null, total: { $sum: '$net_pay' } } },
    ]);
    data.push({ x: `${year}-${String(m).padStart(2, '0')}`, y: sum[0]?.total || 0 });
  }
  res.json({ series: data });
}

export async function payrollDepartment(req: Request, res: Response) {
  const year = Number(req.query.year);
  const month = Number(req.query.month);
  const agg = await PayrollRun.aggregate([
    { $match: { period_year: year, period_month: month } },
    { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    { $group: { _id: '$user.department', value: { $sum: '$net_pay' } } },
    { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dep' } },
    { $unwind: { path: '$dep', preserveNullAndEmptyArrays: true } },
    { $project: { _id: 0, label: { $ifNull: ['$dep.name', 'Unassigned'] }, value: 1 } },
  ]);
  res.json({ breakdown: agg });
}

export async function payrollCoverage(req: Request, res: Response) {
  const year = Number(req.query.year);
  const month = Number(req.query.month);
  const totalEmployees = await User.countDocuments({});
  const processed = await PayrollRun.countDocuments({ period_year: year, period_month: month });
  res.json({ totalEmployees, processed, coverage: totalEmployees ? processed / totalEmployees : 0 });
}

export async function employeeSnapshot(req: Request, res: Response) {
  const userId = req.params.userId as string;
  const from = new Date(req.query.from as string);
  const to = new Date(req.query.to as string);
  const start = startOfMonth(from.getUTCFullYear(), from.getUTCMonth() + 1);
  const end = endOfMonth(to.getUTCFullYear(), to.getUTCMonth() + 1);
  const attendances = await Attendance.find({ user: userId, att_date: { $gte: start, $lte: end } });
  res.json({ userId, range: { from: start, to: end }, attendance: attendances });
}
