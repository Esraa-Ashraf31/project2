import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users, sessions } from "../db/schema.js";

// Find user by email
export async function getUserByEmail(email) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user;
}

// Create a new user
export async function createUser({ username, email, password_hash }) {
  const [user] = await db
    .insert(users)
    .values({
      username,
      email,
      password_hash,
    })
    .returning({
      id: users.id,
      username: users.username,
      email: users.email,
    });

  return user;
}

// Create a new session
export async function createSession({ session_id, user_id, expires_at }) {
  const [session] = await db
    .insert(sessions)
    .values({
      session_id,
      user_id,
      expires_at,
    })
    .returning();

  return session;
}
// Delete session by its ID
export async function deleteSession(session_id) {
  if (!session_id) return;

  await db
    .delete(sessions)
    .where(eq(sessions.session_id, session_id));
}
