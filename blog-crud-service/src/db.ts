import dotenv from "dotenv";
dotenv.config();

import { Pool, QueryResultRow } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://bloguser:blogpass@localhost:5432/blogdb";

export const pool = new Pool({ connectionString });

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
) {
  const result = await pool.query<T>(text, params);
  return result;
}

// Graceful shutdown
process.on("SIGINT", async () => {
  await pool.end();
  process.exit(0);
});
