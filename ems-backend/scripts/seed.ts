import { connectDB } from '../src/config/db';
import { seedAdmin } from '../src/seed/seedAdmin';

async function run() {
  try {
    await connectDB();
    await seedAdmin();
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

run();
