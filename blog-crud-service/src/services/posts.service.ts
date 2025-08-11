import { query } from "../db";
import { CreatePostInput, UpdatePostInput } from "../validation/post.schema";
import { randomUUID } from "crypto";

export type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  author_id: string;
  created_at: string;
  updated_at: string;
};

type ListParams = {
  limit: number;
  offset: number;
  q?: string;
  published?: boolean;
};

export async function listPosts(params: ListParams) {
  const whereClauses: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (typeof params.published === "boolean") {
    whereClauses.push(`published = $${idx++}`);
    values.push(params.published);
  }
  if (params.q) {
    whereClauses.push(`(title ILIKE $${idx} OR content ILIKE $${idx})`);
    values.push(`%${params.q}%`);
    idx++;
  }

  const where = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const listSql = `
    SELECT id, title, slug, content, published, author_id, created_at, updated_at
    FROM posts
    ${where}
    ORDER BY created_at DESC
    OFFSET $${idx++}
    LIMIT $${idx++}
  `;
  values.push(params.offset);
  values.push(params.limit);

  const countSql = `SELECT COUNT(*)::int AS count FROM posts ${where}`;
  const [itemsRes, countRes] = await Promise.all([
    query<Post>(listSql, values),
    query<{ count: number }>(countSql, values.slice(0, values.length - 2))
  ]);

  return {
    items: itemsRes.rows,
    total: countRes.rows[0]?.count || 0,
    limit: params.limit,
    offset: params.offset
  };
}

export async function getPostById(id: string): Promise<Post | null> {
  const res = await query<Post>(
    `SELECT id, title, slug, content, published, author_id, created_at, updated_at
     FROM posts WHERE id = $1`,
    [id]
  );
  return res.rows[0] || null;
}

export async function createPost(
  input: CreatePostInput & { authorId: string }
): Promise<Post> {
  const id = randomUUID();
  const baseSlug = input.slug ? slugify(input.slug) : slugify(input.title);
  const slug = await uniqueSlug(baseSlug);

  const res = await query<Post>(
    `INSERT INTO posts (id, title, slug, content, published, author_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, title, slug, content, published, author_id, created_at, updated_at`,
    [id, input.title, slug, input.content, input.published ?? false, input.authorId]
  );

  return res.rows[0];
}

export async function updatePost(id: string, input: UpdatePostInput): Promise<Post | null> {
  const existing = await getPostById(id);
  if (!existing) return null;

  let newSlug = existing.slug;
  if (input.slug) {
    newSlug = await uniqueSlug(slugify(input.slug), id);
  } else if (input.title) {
    newSlug = await uniqueSlug(slugify(input.title), id);
  }

  const res = await query<Post>(
    `UPDATE posts SET
       title = COALESCE($1, title),
       slug = $2,
       content = COALESCE($3, content),
       published = COALESCE($4, published),
       updated_at = NOW()
     WHERE id = $5
     RETURNING id, title, slug, content, published, author_id, created_at, updated_at`,
    [
      input.title ?? null,
      newSlug,
      input.content ?? null,
      typeof input.published === "boolean" ? input.published : null,
      id
    ]
  );

  return res.rows[0] || null;
}

export async function deletePost(id: string): Promise<boolean> {
  const res = await query(`DELETE FROM posts WHERE id = $1`, [id]);
  return (res.rowCount || 0) > 0;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  let slug = base;
  let i = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const res = await query<{ id: string }>(
      `SELECT id FROM posts WHERE slug = $1 ${ignoreId ? "AND id <> $2" : ""} LIMIT 1`,
      ignoreId ? [slug, ignoreId] : [slug]
    );
    if (res.rowCount === 0) return slug;
    slug = `${base}-${i++}`;
  }
}