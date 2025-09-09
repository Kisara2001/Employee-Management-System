
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ems_quickstart';

const run = async () => {
  await mongoose.connect(MONGO_URI);
  const count = await User.countDocuments();
  if (count > 0) {
    console.log('Users already exist. Aborting.');
    process.exit(0);
  }
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@ems.local';
  const password = process.env.SEED_ADMIN_PASSWORD || 'admin123';
  const hash = await bcrypt.hash(password, 10);
  await User.create({ email, passwordHash: hash, role: 'ADMIN' });
  console.log('Admin seeded:', email);
  process.exit(0);
};

run().catch(e=>{
  console.error(e);
  process.exit(1);
});
