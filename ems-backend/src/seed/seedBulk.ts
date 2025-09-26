import { Department } from '../models/Department';
import { Designation } from '../models/Designation';
import { User } from '../models/User';
import { Shift } from '../models/Shift';
import { EmployeeShift } from '../models/EmployeeShift';
import { Attendance } from '../models/Attendance';
import { SalaryTemplate } from '../models/SalaryTemplate';
import { PayrollRun } from '../models/PayrollRun';
import bcrypt from 'bcryptjs';
import { toDateOnly } from '../utils/date';
import { generatePayroll } from '../services/payrollService';
import { seedAttendanceRange } from './seedAttendanceRange';

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sample<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function seedBulkData() {
  // Attendance range to seed (inclusive)
  const RANGE_FROM = process.env.SEED_FROM || '2025-08-01';
  const RANGE_TO = process.env.SEED_TO || '2025-09-26';
  // 1) Departments
  const depNames = ['Engineering', 'HR', 'Operations'] as const;
  const [depEng, depHR, depOps] = await Promise.all([
    Department.findOneAndUpdate({ name: depNames[0] }, { name: depNames[0], description: 'Builds the product' }, { upsert: true, new: true }),
    Department.findOneAndUpdate({ name: depNames[1] }, { name: depNames[1], description: 'People operations' }, { upsert: true, new: true }),
    Department.findOneAndUpdate({ name: depNames[2] }, { name: depNames[2], description: 'Runs the business' }, { upsert: true, new: true }),
  ]);

  // 2) Designations (2 per department)
  const desDefs = [
    { dep: depEng._id, title: 'Software Engineer', level: 'L1' },
    { dep: depEng._id, title: 'Senior Software Engineer', level: 'L2' },
    { dep: depHR._id, title: 'HR Specialist' },
    { dep: depHR._id, title: 'HR Manager' },
    { dep: depOps._id, title: 'Ops Associate' },
    { dep: depOps._id, title: 'Ops Lead' },
  ];
  const designations = [] as any[];
  for (const d of desDefs) {
    const des = await Designation.findOneAndUpdate(
      { department: d.dep, title: d.title },
      { department: d.dep, title: d.title, level: d.level },
      { upsert: true, new: true }
    );
    designations.push(des);
  }

  // 3) Shifts
  const [day, evening, night] = await Promise.all([
    Shift.findOneAndUpdate({ name: 'Day' }, { name: 'Day', start_time: '09:00', end_time: '17:00', break_minutes: 60 }, { upsert: true, new: true }),
    Shift.findOneAndUpdate({ name: 'Evening' }, { name: 'Evening', start_time: '13:00', end_time: '21:00', break_minutes: 45 }, { upsert: true, new: true }),
    Shift.findOneAndUpdate({ name: 'Night' }, { name: 'Night', start_time: '22:00', end_time: '06:00', break_minutes: 30 }, { upsert: true, new: true }),
  ]);
  const shifts = [day, evening, night];

  // 4) Users (20 employees)
  const firstNames = ['Alice','Bob','Carol','Dan','Eve','Frank','Grace','Hank','Ivy','Jack','Kara','Liam','Mia','Noah','Olga','Paul','Quinn','Ruth','Sara','Tom'];
  const lastNames = ['Anderson','Brown','Clark','Davis','Evans','Foster','Green','Hill','Irwin','Johnson','King','Lopez','Miller','Nelson','Owens','Parker','Quincy','Roberts','Smith','Turner'];
  const createdUsers: any[] = [];
  for (let i = 0; i < 20; i++) {
    const dep = i % 3 === 0 ? depEng : i % 3 === 1 ? depHR : depOps;
    const depDes = designations.filter((d) => String(d.department) === String(dep._id));
    const des = sample(depDes);
    const first = firstNames[i % firstNames.length];
    const last = lastNames[i % lastNames.length];
    const code = `EMP-${(i + 1).toString().padStart(4, '0')}`;
    const email = `${first.toLowerCase()}.${last.toLowerCase()}@example.com`;
    const password_hash = await bcrypt.hash('Password@123', 10);
    const user = await User.findOneAndUpdate(
      { email },
      {
        employee_code: code,
        first_name: first,
        last_name: last,
        email,
        department: dep._id,
        designation: des._id,
        employment_status: 'ACTIVE',
        password_hash,
        role: 'EMPLOYEE',
      },
      { upsert: true, new: true }
    );
    createdUsers.push(user);
  }

  // 5) Assign shifts starting previous month
  const now = new Date();
  const prevMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  for (let i = 0; i < createdUsers.length; i++) {
    const user = createdUsers[i];
    const shift = shifts[i % shifts.length];
    await EmployeeShift.findOneAndUpdate(
      { user: user._id, shift: shift._id },
      { user: user._id, shift: shift._id, start_date: toDateOnly(prevMonth) },
      { upsert: true, new: true }
    );
  }

  // 6) Salary templates for all
  for (const user of createdUsers) {
    const base = rand(3000, 8000);
    const allowFixed = rand(100, 500);
    const allowPct = rand(5, 15);
    const dedFixed = rand(50, 200);
    const dedPct = rand(1, 8);
    await SalaryTemplate.findOneAndUpdate(
      { user: user._id },
      {
        user: user._id,
        basic_salary: base,
        allowance_fixed: allowFixed,
        allowance_percent: allowPct,
        deduction_fixed: dedFixed,
        deduction_percent: dedPct,
        effective_from: prevMonth,
      },
      { upsert: true, new: true }
    );
  }

  // 7) Attendance for specified range (uses shift-aware jittered times)
  await seedAttendanceRange(RANGE_FROM, RANGE_TO);

  // 8) Generate payroll for each full month in range (Aug and Sep 2025 by default)
  const start = new Date(RANGE_FROM);
  const end = new Date(RANGE_TO);
  const months = new Set<string>();
  for (let y = start.getUTCFullYear(); y <= end.getUTCFullYear(); y++) {
    const mStart = y === start.getUTCFullYear() ? start.getUTCMonth() + 1 : 1;
    const mEnd = y === end.getUTCFullYear() ? end.getUTCMonth() + 1 : 12;
    for (let m = mStart; m <= mEnd; m++) months.add(`${y}-${m}`);
  }
  for (const ym of months) {
    const [yy, mm] = ym.split('-').map((x) => parseInt(x, 10));
    // Generate payroll; if month is partial (like current partial month), generation still proceeds
    await generatePayroll(yy, mm);
  }
}

// Danger: clears all EMS data (except indexes). Use with care.
export async function clearAllData() {
  await Promise.all([
    Attendance.deleteMany({}),
    EmployeeShift.deleteMany({}),
    PayrollRun.deleteMany({}),
    SalaryTemplate.deleteMany({}),
    Department.deleteMany({}),
    Designation.deleteMany({}),
    Shift.deleteMany({}),
    // Delete all non-admin users; safer to nuke all and re-seed admin afterwards
    User.deleteMany({}),
  ]);
}
