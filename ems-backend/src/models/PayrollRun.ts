import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IPayrollRun extends Document {
  user: Types.ObjectId;
  period_year: number;
  period_month: number; // 1..12
  working_days: number;
  present_days: number;
  overtime_hours: number;
  basic_salary: number;
  total_allowances: number;
  total_deductions: number;
  gross_pay: number;
  net_pay: number;
  generated_at: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PayrollRunSchema = new Schema<IPayrollRun>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    period_year: { type: Number, required: true },
    period_month: { type: Number, required: true, min: 1, max: 12 },
    working_days: { type: Number, required: true },
    present_days: { type: Number, required: true },
    overtime_hours: { type: Number, default: 0 },
    basic_salary: { type: Number, required: true },
    total_allowances: { type: Number, required: true },
    total_deductions: { type: Number, required: true },
    gross_pay: { type: Number, required: true },
    net_pay: { type: Number, required: true },
    generated_at: { type: Date, default: () => new Date() },
    notes: { type: String },
  },
  { timestamps: true }
);

PayrollRunSchema.index({ user: 1, period_year: 1, period_month: 1 }, { unique: true });

export const PayrollRun: Model<IPayrollRun> =
  mongoose.models.PayrollRun || mongoose.model<IPayrollRun>('PayrollRun', PayrollRunSchema);

