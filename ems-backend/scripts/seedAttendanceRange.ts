import { connectDB } from '../src/config/db';
import { seedAdmin } from '../src/seed/seedAdmin';
import { seedAttendanceRange } from '../src/seed/seedAttendanceRange';

async function run() {
  try {
    await connectDB();
    await seedAdmin();

    const start = process.env.SEED_FROM || '2025-08-01';
    const end = process.env.SEED_TO || '2025-09-26';
    await seedAttendanceRange(start, end);
    // eslint-disable-next-line no-console
    console.log(`Attendance seeded from ${start} to ${end}.`);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

run();

