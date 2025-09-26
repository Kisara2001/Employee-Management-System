import { Department } from '../models/Department';
import { Designation } from '../models/Designation';
import { User } from '../models/User';
import { Shift } from '../models/Shift';
import { EmployeeShift } from '../models/EmployeeShift';
import { Attendance } from '../models/Attendance';
import { SalaryTemplate } from '../models/SalaryTemplate';
import bcrypt from 'bcryptjs';
import { toDateOnly } from '../utils/date';

export async function seedDemoData() {
  // Departments
  const depEng = await Department.findOneAndUpdate({ name: 'Engineering' }, { name: 'Engineering', description: 'Builds the product' }, { upsert: true, new: true });
  const depHR = await Department.findOneAndUpdate({ name: 'HR' }, { name: 'HR', description: 'People operations' }, { upsert: true, new: true });
  const depOps = await Department.findOneAndUpdate({ name: 'Operations' }, { name: 'Operations' }, { upsert: true, new: true });

  // Designations
  const desSE = await Designation.findOneAndUpdate({ department: depEng._id, title: 'Software Engineer' }, { department: depEng._id, title: 'Software Engineer', level: 'L1' }, { upsert: true, new: true });
  const desSSE = await Designation.findOneAndUpdate({ department: depEng._id, title: 'Senior Software Engineer' }, { department: depEng._id, title: 'Senior Software Engineer', level: 'L2' }, { upsert: true, new: true });
  const desHR = await Designation.findOneAndUpdate({ department: depHR._id, title: 'HR Specialist' }, { department: depHR._id, title: 'HR Specialist' }, { upsert: true, new: true });
  const desOps = await Designation.findOneAndUpdate({ department: depOps._id, title: 'Ops Associate' }, { department: depOps._id, title: 'Ops Associate' }, { upsert: true, new: true });

  // Users (excluding admin which already exists)
  const users = [
    { code: 'EMP-0001', first: 'Alice', last: 'Doe', email: 'alice@example.com', dep: depEng._id, des: desSE._id },
    { code: 'EMP-0002', first: 'Bob', last: 'Smith', email: 'bob@example.com', dep: depEng._id, des: desSSE._id },
    { code: 'EMP-0003', first: 'Carol', last: 'Jones', email: 'carol@example.com', dep: depHR._id, des: desHR._id },
    { code: 'EMP-0004', first: 'Dan', last: 'Brown', email: 'dan@example.com', dep: depOps._id, des: desOps._id },
  ];
  for (const u of users) {
    const password_hash = await bcrypt.hash('Password@123', 10);
    await User.findOneAndUpdate(
      { email: u.email },
      {
        employee_code: u.code,
        first_name: u.first,
        last_name: u.last,
        email: u.email,
        department: u.dep,
        designation: u.des,
        employment_status: 'ACTIVE',
        password_hash,
        role: 'EMPLOYEE',
      },
      { upsert: true }
    );
  }

  // Shifts
  const shiftDay = await Shift.findOneAndUpdate({ name: 'Day' }, { name: 'Day', start_time: '09:00', end_time: '17:00', break_minutes: 60 }, { upsert: true, new: true });
  const shiftEvening = await Shift.findOneAndUpdate({ name: 'Evening' }, { name: 'Evening', start_time: '13:00', end_time: '21:00', break_minutes: 45 }, { upsert: true, new: true });

  // Assign first two users to shifts
  const alice = await User.findOne({ email: 'alice@example.com' });
  const bob = await User.findOne({ email: 'bob@example.com' });
  if (alice) {
    await EmployeeShift.findOneAndUpdate(
      { user: alice._id, shift: shiftDay._id, start_date: toDateOnly(new Date()) },
      { user: alice._id, shift: shiftDay._id, start_date: toDateOnly(new Date()) },
      { upsert: true }
    );
  }
  if (bob) {
    await EmployeeShift.findOneAndUpdate(
      { user: bob._id, shift: shiftEvening._id, start_date: toDateOnly(new Date()) },
      { user: bob._id, shift: shiftEvening._id, start_date: toDateOnly(new Date()) },
      { upsert: true }
    );
  }

  // Attendance (recent 5 days) for Alice
  if (alice) {
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - i);
      const attDate = toDateOnly(d);
      await Attendance.findOneAndUpdate(
        { user: alice._id, att_date: attDate },
        { user: alice._id, att_date: attDate, status: 'P', hours_worked: 8 },
        { upsert: true }
      );
    }
  }

  // Salary templates
  if (alice) {
    await SalaryTemplate.findOneAndUpdate(
      { user: alice._id },
      { user: alice._id, basic_salary: 5000, allowance_fixed: 200, allowance_percent: 10, deduction_fixed: 100, deduction_percent: 5, effective_from: new Date() },
      { upsert: true }
    );
  }
  if (bob) {
    await SalaryTemplate.findOneAndUpdate(
      { user: bob._id },
      { user: bob._id, basic_salary: 7000, allowance_fixed: 300, allowance_percent: 12, deduction_fixed: 150, deduction_percent: 4, effective_from: new Date() },
      { upsert: true }
    );
  }
}
