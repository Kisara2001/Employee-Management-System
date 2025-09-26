import { env } from '../config/env';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';

export async function seedAdmin() {
  const existing = await User.findOne({ role: 'ADMIN' });
  if (existing) {
    // eslint-disable-next-line no-console
    console.log(`Admin already exists: ${existing.email}`);
    return existing;
  }
  const password_hash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
  const admin = await User.create({
    employee_code: 'EMP-ADMIN-0001',
    first_name: env.ADMIN_FIRST_NAME,
    last_name: env.ADMIN_LAST_NAME,
    email: env.ADMIN_EMAIL,
    password_hash,
    role: 'ADMIN',
  });
  // eslint-disable-next-line no-console
  console.log(`Seeded initial admin: ${admin.email}`);
  return admin;
}
