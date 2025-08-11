/* Smoke test for Blog CRUD API without Prisma (uses global fetch in Node 18+) */
import "dotenv/config";

const BASE_URL = process.env.BASE_URL || "http://localhost:4000";

type Json = any;

async function req(method: string, path: string, body?: object, headers?: Record<string, string>) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let json: Json | undefined = undefined;
  try {
    json = text ? JSON.parse(text) : undefined;
  } catch {
    /* ignore parse error */
  }
  return { res, json, text };
}

function assertStatus(actual: number, expected: number, context: string) {
  if (actual !== expected) {
    throw new Error(`${context} expected HTTP ${expected}, got ${actual}`);
  }
}

async function main() {
  console.log(`Smoke test against ${BASE_URL}`);

  // 1) Health
  {
    const { res, json } = await req("GET", "/healthz");
    assertStatus(res.status, 200, "GET /healthz");
    if (!json || json.status !== "ok") throw new Error("Health response invalid");
    console.log("✓ /healthz");
  }

  // 2) Create post
  let postId = "";
  {
    const body = {
      title: "Smoke Test Post",
      content: "Created by smoke test",
      published: true
    };
    const { res, json } = await req("POST", "/api/v1/posts", body, {
      "x-user-id": "smoke-user"
    });
    assertStatus(res.status, 201, "POST /api/v1/posts");
    if (!json?.id) throw new Error("Create response missing id");
    postId = json.id;
    console.log("✓ POST /api/v1/posts -> id:", postId);
  }

  // 3) List posts
  {
    const { res, json } = await req("GET", "/api/v1/posts?limit=5&offset=0");
    assertStatus(res.status, 200, "GET /api/v1/posts");
    if (!json || !Array.isArray(json.items)) throw new Error("List response invalid");
    console.log(`✓ GET /api/v1/posts -> ${json.items.length} items`);
  }

  // 4) Get by id
  {
    const { res, json } = await req("GET", `/api/v1/posts/${postId}`);
    assertStatus(res.status, 200, "GET /api/v1/posts/:id");
    if (!json || json.id !== postId) throw new Error("Get-by-id returned wrong id");
    console.log("✓ GET /api/v1/posts/:id");
  }

  // 5) Update post
  {
    const body = { title: "Smoke Test Post (Updated)" };
    const { res, json } = await req("PUT", `/api/v1/posts/${postId}`, body);
    assertStatus(res.status, 200, "PUT /api/v1/posts/:id");
    if (!json || json.title !== body.title) throw new Error("Update did not change title");
    console.log("✓ PUT /api/v1/posts/:id");
  }

  // 6) Delete post
  {
    const { res } = await req("DELETE", `/api/v1/posts/${postId}`);
    assertStatus(res.status, 204, "DELETE /api/v1/posts/:id");
    console.log("✓ DELETE /api/v1/posts/:id");
  }

  // 7) Verify 404 after delete
  {
    const { res } = await req("GET", `/api/v1/posts/${postId}`);
    assertStatus(res.status, 404, "GET /api/v1/posts/:id after delete");
    console.log("✓ GET /api/v1/posts/:id -> 404 after delete");
  }

  console.log("SMOKE OK");
  process.exit(0);
}

main().catch((e) => {
  console.error("SMOKE FAILED:", e?.message || e);
  process.exit(1);
});