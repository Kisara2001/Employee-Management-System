import { connectDB } from '../src/config/db';
import { seedAdmin } from '../src/seed/seedAdmin';
import { clearAllData, seedBulkData } from '../src/seed/seedBulk';

async function run() {
  try {
    await connectDB();
    // Danger: clear everything first
    await clearAllData();
    await seedAdmin();
    await seedBulkData();
    // eslint-disable-next-line no-console
    console.log('Bulk demo data seeded.');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

run();
