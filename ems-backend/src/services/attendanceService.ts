import { Attendance } from '../models/Attendance';
import { toDateOnly } from '../utils/date';

export async function getPresentDaysInRange(userId: string, from: Date, to: Date): Promise<number> {
  const f = toDateOnly(from);
  const t = toDateOnly(to);
  return Attendance.countDocuments({ user: userId, att_date: { $gte: f, $lte: t }, status: 'P' });
}
