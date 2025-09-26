import { Attendance } from '../models/Attendance';
import { SalaryTemplate } from '../models/SalaryTemplate';
import { PayrollRun } from '../models/PayrollRun';
import { startOfMonth, endOfMonth, weekdaysInMonth } from '../utils/date';
import { calcGross, calcDeductions, calcNet } from '../utils/calc';

export async function generatePayroll(year: number, month: number, userId?: string) {
  const filter: any = {};
  if (userId) filter.user = userId;
  const rangeStart = startOfMonth(year, month);
  const rangeEnd = endOfMonth(year, month);
  const workingDays = weekdaysInMonth(year, month);

  const templates = await SalaryTemplate.find(filter);
  const results = [] as any[];
  for (const tpl of templates) {
    const presents = await Attendance.countDocuments({
      user: tpl.user,
      att_date: { $gte: rangeStart, $lte: rangeEnd },
      status: 'P',
    });

    const basic = tpl.basic_salary;
    const gross = calcGross(basic, tpl.allowance_fixed, tpl.allowance_percent);
    const deductions = calcDeductions(basic, tpl.deduction_fixed, tpl.deduction_percent);
    const net = calcNet(gross, deductions);

    const run = await PayrollRun.findOneAndUpdate(
      { user: tpl.user, period_year: year, period_month: month },
      {
        $set: {
          working_days: workingDays,
          present_days: presents,
          overtime_hours: 0,
          basic_salary: basic,
          total_allowances: gross - basic,
          total_deductions: deductions,
          gross_pay: gross,
          net_pay: net,
          generated_at: new Date(),
        },
      },
      { upsert: true, new: true }
    );
    results.push(run);
  }
  return results;
}
