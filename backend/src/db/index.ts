import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

let db: ReturnType<typeof drizzle>;
let client: ReturnType<typeof postgres>;

export const initializeDatabase = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is required');
  }

  client = postgres(connectionString, {
    max: 20,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  db = drizzle(client, { schema });

  return db;
};

export const closeDatabase = async () => {
  if (client) {
    await client.end();
  }
};

export const getDb = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
};

export { db };
export * from './schema';
