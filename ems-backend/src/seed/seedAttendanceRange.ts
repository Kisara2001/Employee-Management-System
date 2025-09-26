import { User } from '../models/User';
import { EmployeeShift } from '../models/EmployeeShift';
import { Attendance } from '../models/Attendance';
import { toDateOnly } from '../utils/date';

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isWeekend(d: Date) {
  const wd = d.getUTCDay();
  return wd === 0 || wd === 6; // Sun/Sat
}

export async function seedAttendanceRange(startISO: string, endISO: string) {
  const start = new Date(startISO);
  const end = new Date(endISO);
  if (!(start instanceof Date) || isNaN(start.getTime()) || !(end instanceof Date) || isNaN(end.getTime())) {
    throw new Error('Invalid date range');
  }

  const users = await User.find({ employment_status: 'ACTIVE' });
  // Preload shift assignments per user (basic cache to reduce queries)
  const assignments = await EmployeeShift.find({ start_date: { $lte: end } }).populate('shift');

  const getUserShiftForDay = (userId: string, day: Date) => {
    const a = assignments.find(
      (x: any) => String(x.user) === String(userId) && x.start_date <= day && (!x.end_date || x.end_date >= day)
    );
    const shift = a?.shift as any;
    const start_time: string = shift?.start_time || '09:00';
    return start_time;
  };

  for (let d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate())); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const attDate = toDateOnly(d);
    for (const user of users) {
      // Weekends as holiday
      if (isWeekend(d)) {
        await Attendance.findOneAndUpdate(
          { user: user._id, att_date: attDate },
          { user: user._id, att_date: attDate, status: 'H', check_in: undefined, check_out: undefined, hours_worked: undefined },
          { upsert: true }
        );
        continue;
      }

      // Randomize status: mostly present
      const r = Math.random();
      let status: 'P' | 'A' | 'L' | 'H' = 'P';
      if (r < 0.07) status = 'A';
      else if (r < 0.12) status = 'L';

      let check_in: Date | undefined;
      let check_out: Date | undefined;
      let hours: number | undefined;
      if (status === 'P') {
        const st = getUserShiftForDay(String(user._id), attDate);
        const [sh, sm] = st.split(':').map((x) => parseInt(x, 10));
        const ci = new Date(attDate);
        ci.setUTCHours(isNaN(sh) ? 9 : sh, isNaN(sm) ? 0 : sm);
        ci.setUTCMinutes(ci.getUTCMinutes() + rand(-25, 25));
        check_in = ci;
        const co = new Date(ci);
        co.setUTCHours(co.getUTCHours() + 8);
        co.setUTCMinutes(co.getUTCMinutes() + rand(-25, 25));
        check_out = co;
        const ms = (check_out.getTime() - check_in.getTime()) / 1000 / 60 / 60;
        hours = Math.max(0, Number(ms.toFixed(2)));
      }

      await Attendance.findOneAndUpdate(
        { user: user._id, att_date: attDate },
        { user: user._id, att_date: attDate, status, check_in, check_out, hours_worked: hours },
        { upsert: true }
      );
    }
  }
}

