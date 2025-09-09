
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import morgan from 'morgan';

import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import departmentRoutes from './routes/departments.js';
import attendanceRoutes from './routes/attendance.js';

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') || true, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req,res)=> res.json({ ok: true, message: 'EMS Backend running' }));

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/attendance', attendanceRoutes);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ems_quickstart';
const PORT = process.env.PORT || 3001;

mongoose.connect(MONGO_URI).then(()=>{
  console.log('Connected to MongoDB');
  app.listen(PORT, ()=> console.log(`EMS backend listening on ${PORT}`));
}).catch(err=>{
  console.error('MongoDB connection error:', err.message);
  process.exit(1);
});
