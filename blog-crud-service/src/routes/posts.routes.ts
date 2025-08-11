import { Router } from "express";
import * as controller from "../controllers/posts.controller";

const router = Router();

// List with optional filters and pagination
router.get("/", controller.listPosts);

// Get by ID
router.get("/:id", controller.getPostById);

// Create
router.post("/", controller.createPost);

// Update
router.put("/:id", controller.updatePost);

// Delete
router.delete("/:id", controller.deletePost);

export default router;