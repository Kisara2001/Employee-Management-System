import { Request, Response } from 'express';
import { Attendance } from '../models/Attendance';
import { EmployeeShift } from '../models/EmployeeShift';
import { PayrollRun } from '../models/PayrollRun';
import { User } from '../models/User';
import { toDateOnly, parseISODate } from '../utils/date';
import { buildExcelBuffer, sendExcel } from '../utils/excel';

function maybeFormat(fmt?: string) {
  // Default to excel; allow ?format=json for API consumers
  return fmt === 'json' ? 'json' : 'excel';
}

export async function attendanceDaily(req: Request, res: Response) {
  const format = maybeFormat(req.query.format as string);
  const date = req.query.date as string;
  if (!date) return res.status(400).json({ message: 'Missing date' });
  const day = toDateOnly(date);
  const items = await Attendance.find({ att_date: day }).populate('user');
  if (format === 'json') return res.json({ data: items });
  const columns = [
    { header: 'Employee Code', key: 'code' },
    { header: 'Name', key: 'name' },
    { header: 'Date', key: 'date' },
    { header: 'Status', key: 'status' },
    { header: 'Check In', key: 'check_in' },
    { header: 'Check Out', key: 'check_out' },
    { header: 'Hours Worked', key: 'hours' },
  ];
  const rows = items.map((a) => ({
    code: (a.user as any)?.employee_code,
    name: `${(a.user as any)?.first_name ?? ''} ${(a.user as any)?.last_name ?? ''}`.trim(),
    date: a.att_date?.toISOString?.().slice(0, 10),
    status: a.status,
    check_in: a.check_in ? new Date(a.check_in).toISOString() : '',
    check_out: a.check_out ? new Date(a.check_out).toISOString() : '',
    hours: a.hours_worked ?? '',
  }));
  const buf = await buildExcelBuffer(columns, rows, 'Attendance Daily');
  return sendExcel(res, `attendance-daily-${date}.xlsx`, buf);
}

export async function attendanceRange(req: Request, res: Response) {
  const format = maybeFormat(req.query.format as string);
  const from = req.query.from as string;
  const to = req.query.to as string;
  if (!from || !to) return res.status(400).json({ message: 'Missing range' });
  const items = await Attendance.find({
    att_date: { $gte: toDateOnly(from), $lte: toDateOnly(to) },
  }).populate('user');
  if (format === 'json') return res.json({ data: items });
  const columns = [
    { header: 'Employee Code', key: 'code' },
    { header: 'Name', key: 'name' },
    { header: 'Date', key: 'date' },
    { header: 'Status', key: 'status' },
    { header: 'Check In', key: 'check_in' },
    { header: 'Check Out', key: 'check_out' },
    { header: 'Hours Worked', key: 'hours' },
  ];
  const rows = items.map((a) => ({
    code: (a.user as any)?.employee_code,
    name: `${(a.user as any)?.first_name ?? ''} ${(a.user as any)?.last_name ?? ''}`.trim(),
    date: a.att_date?.toISOString?.().slice(0, 10),
    status: a.status,
    check_in: a.check_in ? new Date(a.check_in).toISOString() : '',
    check_out: a.check_out ? new Date(a.check_out).toISOString() : '',
    hours: a.hours_worked ?? '',
  }));
  const buf = await buildExcelBuffer(columns, rows, 'Attendance Range');
  return sendExcel(res, `attendance-range-${from}_to_${to}.xlsx`, buf);
}

export async function attendanceSummary(req: Request, res: Response) {
  const year = Number(req.query.year);
  const month = Number(req.query.month);
  if (!year || !month) return res.status(400).json({ message: 'Missing year/month' });
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59));
  const agg = await Attendance.aggregate([
    { $match: { att_date: { $gte: start, $lte: end } } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const format = maybeFormat(req.query.format as string);
  if (format === 'json') return res.json({ data: agg });
  const columns = [
    { header: 'Status', key: 'status' },
    { header: 'Count', key: 'count' },
  ];
  const rows = agg.map((r: any) => ({ status: r._id, count: r.count }));
  const buf = await buildExcelBuffer(columns, rows, 'Attendance Summary');
  return sendExcel(res, `attendance-summary-${year}-${String(month).padStart(2, '0')}.xlsx`, buf);
}

export async function attendanceLate(req: Request, res: Response) {
  const format = maybeFormat(req.query.format as string);
  const columns = [
    { header: 'Employee Code', key: 'code' },
    { header: 'Name', key: 'name' },
    { header: 'Date', key: 'date' },
    { header: 'Minutes Late', key: 'late' },
  ];
  const rows: any[] = [];
  if (format === 'json') return res.json({ data: rows, note: 'TODO: compute late based on check_in vs shift' });
  const buf = await buildExcelBuffer(columns, rows, 'Late Report');
  return sendExcel(res, `attendance-late.xlsx`, buf);
}

export async function shiftsCoverage(req: Request, res: Response) {
  const date = req.query.date as string;
  if (!date) return res.status(400).json({ message: 'Missing date' });
  const day = parseISODate(date);
  const items = await EmployeeShift.find({ start_date: { $lte: day }, $or: [{ end_date: null }, { end_date: { $gte: day } }] })
    .populate('user shift');
  const format = maybeFormat(req.query.format as string);
  if (format === 'json') return res.json({ data: items });
  const columns = [
    { header: 'Employee Code', key: 'code' },
    { header: 'Name', key: 'name' },
    { header: 'Shift', key: 'shift' },
    { header: 'Start', key: 'start' },
    { header: 'End', key: 'end' },
  ];
  const rows = items.map((a) => ({
    code: (a.user as any)?.employee_code,
    name: `${(a.user as any)?.first_name ?? ''} ${(a.user as any)?.last_name ?? ''}`.trim(),
    shift: (a.shift as any)?.name,
    start: a.start_date ? new Date(a.start_date).toISOString() : '',
    end: a.end_date ? new Date(a.end_date).toISOString() : '',
  }));
  const buf = await buildExcelBuffer(columns, rows, 'Shifts Coverage');
  return sendExcel(res, `shifts-coverage-${date}.xlsx`, buf);
}

export async function shiftsRoster(req: Request, res: Response) {
  const from = req.query.from as string;
  const to = req.query.to as string;
  if (!from || !to) return res.status(400).json({ message: 'Missing range' });
  const items = await EmployeeShift.find({ start_date: { $lte: new Date(to) }, $or: [{ end_date: null }, { end_date: { $gte: new Date(from) } }] })
    .populate('user shift');
  const format = maybeFormat(req.query.format as string);
  if (format === 'json') return res.json({ data: items });
  const columns = [
    { header: 'Employee Code', key: 'code' },
    { header: 'Name', key: 'name' },
    { header: 'Shift', key: 'shift' },
    { header: 'Start', key: 'start' },
    { header: 'End', key: 'end' },
  ];
  const rows = items.map((a) => ({
    code: (a.user as any)?.employee_code,
    name: `${(a.user as any)?.first_name ?? ''} ${(a.user as any)?.last_name ?? ''}`.trim(),
    shift: (a.shift as any)?.name,
    start: a.start_date ? new Date(a.start_date).toISOString() : '',
    end: a.end_date ? new Date(a.end_date).toISOString() : '',
  }));
  const buf = await buildExcelBuffer(columns, rows, 'Shifts Roster');
  return sendExcel(res, `shifts-roster-${from}_to_${to}.xlsx`, buf);
}

export async function payrollSummary(req: Request, res: Response) {
  const year = Number(req.query.year);
  const month = Number(req.query.month);
  if (!year || !month) return res.status(400).json({ message: 'Missing year/month' });
  const agg = await PayrollRun.aggregate([
    { $match: { period_year: year, period_month: month } },
    { $group: { _id: null, total_net: { $sum: '$net_pay' }, count: { $sum: 1 } } },
  ]);
  const data = agg[0] || { total_net: 0, count: 0 };
  const format = maybeFormat(req.query.format as string);
  if (format === 'json') return res.json({ data });
  const columns = [
    { header: 'Year', key: 'year' },
    { header: 'Month', key: 'month' },
    { header: 'Total Net', key: 'total_net' },
    { header: 'Count', key: 'count' },
  ];
  const rows = [{ year, month, total_net: data.total_net, count: data.count }];
  const buf = await buildExcelBuffer(columns, rows, 'Payroll Summary');
  return sendExcel(res, `payroll-summary-${year}-${String(month).padStart(2, '0')}.xlsx`, buf);
}

export async function payrollPayslip(req: Request, res: Response) {
  const userId = req.query.userId as string;
  const year = Number(req.query.year);
  const month = Number(req.query.month);
  if (!userId || !year || !month) return res.status(400).json({ message: 'Missing fields' });
  const item = await PayrollRun.findOne({ user: userId, period_year: year, period_month: month }).populate('user');
  if (!item) return res.status(404).json({ message: 'Payslip not found' });
  const format = maybeFormat(req.query.format as string);
  if (format === 'json') return res.json(item);
  const columns = [
    { header: 'Employee Code', key: 'code' },
    { header: 'Name', key: 'name' },
    { header: 'Year', key: 'year' },
    { header: 'Month', key: 'month' },
    { header: 'Basic', key: 'basic' },
    { header: 'Allowances', key: 'allowances' },
    { header: 'Deductions', key: 'deductions' },
    { header: 'Gross', key: 'gross' },
    { header: 'Net', key: 'net' },
    { header: 'Present Days', key: 'present' },
    { header: 'Working Days', key: 'working' },
  ];
  const u: any = item.user;
  const rows = [{
    code: u?.employee_code,
    name: `${u?.first_name ?? ''} ${u?.last_name ?? ''}`.trim(),
    year: item.period_year,
    month: item.period_month,
    basic: item.basic_salary,
    allowances: item.total_allowances,
    deductions: item.total_deductions,
    gross: item.gross_pay,
    net: item.net_pay,
    present: item.present_days,
    working: item.working_days,
  }];
  const buf = await buildExcelBuffer(columns, rows, 'Payslip');
  return sendExcel(res, `payslip-${year}-${String(month).padStart(2, '0')}.xlsx`, buf);
}

export async function salaryDepartmentCost(req: Request, res: Response) {
  const year = Number(req.query.year);
  const month = Number(req.query.month);
  const agg = await PayrollRun.aggregate([
    { $match: { period_year: year, period_month: month } },
    { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    { $group: { _id: '$user.department', total_net: { $sum: '$net_pay' } } },
  ]);
  const format = maybeFormat(req.query.format as string);
  if (format === 'json') return res.json({ data: agg });
  const columns = [
    { header: 'DepartmentId', key: 'department' },
    { header: 'Total Net', key: 'total_net' },
  ];
  const rows = agg.map((r: any) => ({ department: r._id || 'Unassigned', total_net: r.total_net }));
  const buf = await buildExcelBuffer(columns, rows, 'Department Cost');
  return sendExcel(res, `salary-department-cost-${year}-${String(month).padStart(2, '0')}.xlsx`, buf);
}

export async function overtimeReport(_req: Request, res: Response) {
  const format = maybeFormat(_req.query.format as string);
  const columns = [
    { header: 'Employee Code', key: 'code' },
    { header: 'Name', key: 'name' },
    { header: 'Hours', key: 'hours' },
  ];
  const rows: any[] = [];
  if (format === 'json') return res.json({ data: rows, note: 'Overtime not tracked; placeholder' });
  const buf = await buildExcelBuffer(columns, rows, 'Overtime');
  return sendExcel(res, `overtime.xlsx`, buf);
}

export async function headcount(req: Request, res: Response) {
  const filter: any = {};
  if (req.query.departmentId) filter.department = req.query.departmentId;
  const count = await User.countDocuments(filter);
  const format = maybeFormat(req.query.format as string);
  if (format === 'json') return res.json({ count });
  const columns = [
    { header: 'DepartmentId', key: 'department' },
    { header: 'Count', key: 'count' },
  ];
  const rows = [{ department: filter.department || 'All', count }];
  const buf = await buildExcelBuffer(columns, rows, 'Headcount');
  return sendExcel(res, `headcount.xlsx`, buf);
}

export async function employeeProfile(req: Request, res: Response) {
  const userId = req.query.userId as string;
  const user = await User.findById(userId).populate('department designation');
  if (!user) return res.status(404).json({ message: 'User not found' });
  const format = maybeFormat(req.query.format as string);
  if (format === 'json') return res.json(user);
  const columns = [
    { header: 'Employee Code', key: 'code' },
    { header: 'First Name', key: 'first' },
    { header: 'Last Name', key: 'last' },
    { header: 'Email', key: 'email' },
    { header: 'Department', key: 'department' },
    { header: 'Designation', key: 'designation' },
    { header: 'Status', key: 'status' },
  ];
  const rows = [{
    code: (user as any).employee_code,
    first: (user as any).first_name,
    last: (user as any).last_name,
    email: user.email,
    department: (user as any).department?._id || '',
    designation: (user as any).designation?._id || '',
    status: (user as any).employment_status,
  }];
  const buf = await buildExcelBuffer(columns, rows, 'Employee Profile');
  return sendExcel(res, `employee-profile-${userId}.xlsx`, buf);
}
