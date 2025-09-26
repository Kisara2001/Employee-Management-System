import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ISalaryTemplate extends Document {
  user: Types.ObjectId;
  basic_salary: number;
  allowance_fixed: number;
  allowance_percent: number;
  deduction_fixed: number;
  deduction_percent: number;
  effective_from: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SalaryTemplateSchema = new Schema<ISalaryTemplate>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    basic_salary: { type: Number, required: true },
    allowance_fixed: { type: Number, default: 0 },
    allowance_percent: { type: Number, default: 0 },
    deduction_fixed: { type: Number, default: 0 },
    deduction_percent: { type: Number, default: 0 },
    effective_from: { type: Date, required: true },
  },
  { timestamps: true }
);

// unique index handled via field definition

export const SalaryTemplate: Model<ISalaryTemplate> =
  mongoose.models.SalaryTemplate || mongoose.model<ISalaryTemplate>('SalaryTemplate', SalaryTemplateSchema);
