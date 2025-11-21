import { AppDataSource } from './data-source';
import { seedSimulados } from './seeds/simulados.seed';

async function run() {
  const ds = await AppDataSource.initialize();
  try {
    await seedSimulados(ds);
  } finally {
    await ds.destroy();
  }
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to run seeds', err);
  process.exit(1);
});
