import { Request, Response, NextFunction } from "express";
import * as service from "../services/posts.service";
import { createPostSchema, updatePostSchema } from "../validation/post.schema";

export async function listPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const { limit, offset, q, published } = req.query;
    const result = await service.listPosts({
      limit: limit ? Number(limit) : 20,
      offset: offset ? Number(offset) : 0,
      q: q ? String(q) : undefined,
      published: typeof published !== "undefined" ? published === "true" : undefined
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getPostById(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await service.getPostById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    next(err);
  }
}

export async function createPost(req: Request, res: Response, next: NextFunction) {
  try {
    const parse = createPostSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ message: "Invalid data", errors: parse.error.flatten() });

    // In real system, authorId should come from auth middleware/JWT.
    const authorId = req.header("x-user-id") || "anonymous";

    const created = await service.createPost({ ...parse.data, authorId });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

export async function updatePost(req: Request, res: Response, next: NextFunction) {
  try {
    const parse = updatePostSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ message: "Invalid data", errors: parse.error.flatten() });

    const updated = await service.updatePost(req.params.id, parse.data);
    if (!updated) return res.status(404).json({ message: "Post not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deletePost(req: Request, res: Response, next: NextFunction) {
  try {
    const deleted = await service.deletePost(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Post not found" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}