
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['ADMIN','HR','MANAGER','EMPLOYEE'], default: 'EMPLOYEE' },
  isActive: { type: Boolean, default: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
