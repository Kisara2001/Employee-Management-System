import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export type EmploymentStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';
export type UserRole = 'ADMIN' | 'EMPLOYEE';

export interface IUser extends Document {
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department?: Types.ObjectId;
  designation?: Types.ObjectId;
  hire_date?: Date;
  employment_status: EmploymentStatus;
  password_hash: string;
  role: UserRole;
  password?: string; // virtual for pre-save hashing
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    employee_code: { type: String, required: true, unique: true, trim: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String },
    department: { type: Schema.Types.ObjectId, ref: 'Department' },
    designation: { type: Schema.Types.ObjectId, ref: 'Designation' },
    hire_date: { type: Date },
    employment_status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED'],
      default: 'ACTIVE',
    },
    password_hash: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'EMPLOYEE'], default: 'EMPLOYEE' },
  },
  { timestamps: true }
);

UserSchema.virtual('password');

UserSchema.pre('save', async function (next) {
  const self = this as unknown as IUser & { password?: string };
  const maybePassword = (self as any).password as string | undefined;
  if (maybePassword) {
    const salt = await bcrypt.genSalt(10);
    self.password_hash = await bcrypt.hash(maybePassword, salt);
    (self as any).password = undefined;
  }
  next();
});

UserSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password_hash);
};

// unique indexes handled via field definitions

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
