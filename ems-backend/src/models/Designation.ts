import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IDesignation extends Document {
  department: Types.ObjectId;
  title: string;
  level?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DesignationSchema = new Schema<IDesignation>(
  {
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    title: { type: String, required: true, trim: true },
    level: { type: String },
  },
  { timestamps: true }
);

DesignationSchema.index({ department: 1, title: 1 }, { unique: true });

export const Designation: Model<IDesignation> =
  mongoose.models.Designation || mongoose.model<IDesignation>('Designation', DesignationSchema);

