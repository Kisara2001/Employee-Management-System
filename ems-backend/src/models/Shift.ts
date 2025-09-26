import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IShift extends Document {
  name: string;
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  break_minutes: number;
  createdAt: Date;
  updatedAt: Date;
}

const ShiftSchema = new Schema<IShift>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    start_time: { type: String, required: true },
    end_time: { type: String, required: true },
    break_minutes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// unique index handled via field definition

export const Shift: Model<IShift> = mongoose.models.Shift || mongoose.model<IShift>('Shift', ShiftSchema);
