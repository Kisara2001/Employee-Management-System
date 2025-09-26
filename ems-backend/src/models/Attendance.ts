import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type AttendanceStatus = 'P' | 'A' | 'L' | 'H';

export interface IAttendance extends Document {
  user: Types.ObjectId;
  att_date: Date; // Date only
  status: AttendanceStatus;
  check_in?: Date;
  check_out?: Date;
  hours_worked: number;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    att_date: { type: Date, required: true },
    status: { type: String, enum: ['P', 'A', 'L', 'H'], required: true },
    check_in: { type: Date },
    check_out: { type: Date },
    hours_worked: { type: Number, default: 0 },
  },
  { timestamps: true }
);

AttendanceSchema.index({ user: 1, att_date: 1 }, { unique: true });

export const Attendance: Model<IAttendance> =
  mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);

