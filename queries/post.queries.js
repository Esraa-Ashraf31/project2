import { db } from "../db/index.js";
import { posts, users, likes, comments } from "../db/schema.js";
import { and, desc, eq, sql } from "drizzle-orm";

export async function getAllPosts(userId) {
  return db
    .select({
      id: posts.id,
      content: posts.content,
      image: posts.image,
      created_at: posts.created_at,
      username: users.username,

      like_count: sql`
        (
          SELECT COUNT(*)::int
          FROM ${likes}
          WHERE ${likes.post_id} = ${posts.id}
        )
      `.mapWith(Number),

      comment_count: sql`
        (
          SELECT COUNT(*)::int
          FROM ${comments}
          WHERE ${comments.post_id} = ${posts.id}
        )
      `.mapWith(Number),

      liked_by_me: sql`
        EXISTS (
          SELECT 1
          FROM ${likes}
          WHERE ${likes.post_id} = ${posts.id}
          AND ${likes.user_id} = ${userId}
        )
      `.mapWith(Boolean),
    })
    .from(posts)
    .innerJoin(users, eq(posts.user_id, users.id))
    .orderBy(desc(posts.created_at));
}

export async function getPostById(postId, userId) {
  const [post] = await db
    .select({
      id: posts.id,
      content: posts.content,
      image: posts.image,
      created_at: posts.created_at,
      username: users.username,

      like_count: sql`
        (
          SELECT COUNT(*)::int
          FROM ${likes}
          WHERE ${likes.post_id} = ${posts.id}
        )
      `.mapWith(Number),

      comment_count: sql`
        (
          SELECT COUNT(*)::int
          FROM ${comments}
          WHERE ${comments.post_id} = ${posts.id}
        )
      `.mapWith(Number),

      liked_by_me: sql`
        EXISTS (
          SELECT 1
          FROM ${likes}
          WHERE ${likes.post_id} = ${posts.id}
          AND ${likes.user_id} = ${userId}
        )
      `.mapWith(Boolean),
    })
    .from(posts)
    .innerJoin(users, eq(posts.user_id, users.id))
    .where(eq(posts.id, postId))
    .limit(1);

  return post;
}

export async function postExists(postId) {
  const [post] = await db
    .select({ id: posts.id })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  return Boolean(post);
}

export async function createPost({ userId, content, image }) {
  const [post] = await db
    .insert(posts)
    .values({
      user_id: userId,
      content,
      image: image ?? null,
    })
    .returning();

  return post;
}

export async function togglePostLike(postId, userId) {
  // i used transactions for when i a step failed the all process failed
  //check if the user make like to this post or not
  return db.transaction(async (tx) => {
    const [existingLike] = await tx
      .select()
      .from(likes)
      .where(and(eq(likes.post_id, postId),eq(likes.user_id, userId),),)
      .limit(1);
//if user make like delete the like 
    if (existingLike) {
      await tx
        .delete(likes)
        .where(and(eq(likes.post_id, postId),eq(likes.user_id, userId),),);
    } 
    //if the user doesnot make like add it
    else {
      await tx.insert(likes).values({
        user_id: userId,
        post_id: postId,
      });
    }
//count the num of likes
    const [result] = await tx
      .select({
        count: sql`COUNT(*)::int`.mapWith(Number),
      })
      .from(likes)
      .where(eq(likes.post_id, postId));

    return {
      liked: !existingLike,
      like_count: result.count,
    };
  });
}