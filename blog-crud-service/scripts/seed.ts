import { query } from "../src/db";
import { randomUUID } from "crypto";

async function upsertPost(title: string, slug: string, content: string, published: boolean) {
  // Insert if slug not exists
  await query(
    `INSERT INTO posts (id, title, slug, content, published, author_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (slug) DO NOTHING`,
    [randomUUID(), title, slug, content, published, "seed-user"]
  );
}

async function main() {
  await upsertPost("Hello World", "hello-world", "This is the first post.", true);
  await upsertPost("Draft Post", "draft-post", "Work in progress...", false);
  // eslint-disable-next-line no-console
  console.log("Seed complete");
  process.exit(0);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});