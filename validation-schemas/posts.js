import { createInsertSchema } from "drizzle-orm/zod";
import { posts, comments } from "../db/schema.js";

export const createPostSchema = createInsertSchema(posts, {
  content: (schema) =>
    schema
      .trim()
      .min(1, "post content cannot be empty")
      .max(5000, "post content must be at most 5000 characters"),
})
  .omit({
    id: true,
    user_id: true,
    image: true,
    created_at: true,
  })
  .required({
    content: true,
  });

export const createCommentSchema = createInsertSchema(comments, {
  content: (schema) =>
    schema
      .trim()
      .min(1, "comment content cannot be empty")
      .max(2000, "comment content must be at most 2000 characters"),
})
  .omit({
    id: true,
    post_id: true,
    user_id: true,
    created_at: true,
  })
  .required({
    content: true,
  });