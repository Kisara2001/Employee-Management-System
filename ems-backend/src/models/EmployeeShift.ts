import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IEmployeeShift extends Document {
  user: Types.ObjectId;
  shift: Types.ObjectId;
  start_date: Date;
  end_date?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeShiftSchema = new Schema<IEmployeeShift>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    shift: { type: Schema.Types.ObjectId, ref: 'Shift', required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date },
  },
  { timestamps: true }
);

EmployeeShiftSchema.index({ user: 1, start_date: 1, end_date: 1 });

export const EmployeeShift: Model<IEmployeeShift> =
  mongoose.models.EmployeeShift || mongoose.model<IEmployeeShift>('EmployeeShift', EmployeeShiftSchema);

