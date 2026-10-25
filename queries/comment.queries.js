import { db } from "../db/index.js";
import { comments, users } from "../db/schema.js";
import { asc, eq } from "drizzle-orm";

export async function getCommentsByPostId(postId) {
  return db
    .select({
      id: comments.id,
      content: comments.content,
      created_at: comments.created_at,
      username: users.username,
    })
    .from(comments)
    .innerJoin(users, eq(comments.user_id, users.id))
    .where(eq(comments.post_id, postId))
    .orderBy(asc(comments.created_at));
}

export async function createComment({ postId, userId, content }) {
  const [comment] = await db
    .insert(comments)
    .values({
      post_id: postId,
      user_id: userId,
      content,
    })
    .returning();

  const [result] = await db
    .select({
      id: comments.id,
      content: comments.content,
      created_at: comments.created_at,
      username: users.username,
    })
    .from(comments)
    .innerJoin(users, eq(comments.user_id, users.id))
    .where(eq(comments.id, comment.id))
    .limit(1);

  return result;
}