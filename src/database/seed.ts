import { AppDataSource } from './data-source';
import { seedExams } from './seeds/exams.seed';

async function run() {
  const ds = await AppDataSource.initialize();
  try {
    await seedExams(ds);
  } finally {
    await ds.destroy();
  }
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to run seeds', err);
  process.exit(1);
});
