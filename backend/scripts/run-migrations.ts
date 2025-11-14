import 'reflect-metadata';
import { AppDataSource } from '../src/config/database';

async function run() {
  try {
    await AppDataSource.initialize();
    console.log('DataSource initialized. Running migrations...');
    const result = await AppDataSource.runMigrations();
    console.log(
      'Migrations executed:',
      result.map((m) => m.name)
    );
    await AppDataSource.destroy();
    process.exit(0);
  } catch (err) {
    console.error('Migration error', err);
    process.exit(1);
  }
}

run();
