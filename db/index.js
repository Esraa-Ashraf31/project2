import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

process.loadEnvFile()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle({ client: pool });
