import { connectDB } from '../src/config/db';
import { seedAdmin } from '../src/seed/seedAdmin';
import { seedDemoData } from '../src/seed/seedDemo';
import { generatePayroll } from '../src/services/payrollService';

async function run() {
  try {
    await connectDB();
    await seedAdmin();
    await seedDemoData();
    const now = new Date();
    await generatePayroll(now.getUTCFullYear(), now.getUTCMonth() + 1);
    console.log('Demo data seeded.');
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

run();
