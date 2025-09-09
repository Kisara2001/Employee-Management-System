
import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true }, // like EMP-0001
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  gender: { type: String, enum: ['MALE','FEMALE','OTHER'] },
  dob: Date,
  address: String,
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  designation: String,
  joinDate: Date,
  employmentType: { type: String, enum: ['PERMANENT','CONTRACT','INTERNSHIP'], default: 'PERMANENT' },
  status: { type: String, enum: ['ACTIVE','INACTIVE','TERMINATED','RESIGNED'], default: 'ACTIVE' },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  documents: [{ name: String, url: String, type: String }],
}, { timestamps: true });

employeeSchema.index({ firstName: 'text', lastName: 'text', email: 'text', code: 'text', designation: 'text' });

export default mongoose.model('Employee', employeeSchema);
