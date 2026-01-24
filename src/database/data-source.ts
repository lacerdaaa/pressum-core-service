import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();
const databaseUrl = process.env.DATABASE_URL;
const sslEnabled =
  process.env.DATABASE_SSL === 'true' ||
  (databaseUrl ? databaseUrl.includes('sslmode=require') : false);
const ssl = sslEnabled ? { rejectUnauthorized: false } : undefined;

const baseOptions = {
  type: 'postgres' as const,
  url: databaseUrl,
  ssl,
  entities: ['src/modules/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
};

const connectionOptions = databaseUrl
  ? {}
  : {
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT ?? 5432),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    };

export const AppDataSource = new DataSource({
  ...baseOptions,
  ...connectionOptions,
});
