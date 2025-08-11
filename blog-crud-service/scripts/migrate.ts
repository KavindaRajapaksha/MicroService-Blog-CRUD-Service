import { query } from "../src/db";

async function migrate() {
  // Idempotent DDL (safe to run multiple times)
  const sql = `
  CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    published BOOLEAN NOT NULL DEFAULT FALSE,
    author_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts (created_at DESC);
  `;
  await query(sql);
  // eslint-disable-next-line no-console
  console.log("Migration complete");
  process.exit(0);
}

migrate().catch((e) => {
  // eslint-disable-next-line no-console
  console.error("Migration failed:", e);
  process.exit(1);
});