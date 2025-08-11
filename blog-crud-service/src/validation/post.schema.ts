import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().min(3).max(220).optional(),
  content: z.string().min(1),
  published: z.boolean().optional()
});

export const updatePostSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  slug: z.string().min(3).max(220).optional(),
  content: z.string().min(1).optional(),
  published: z.boolean().optional()
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;