import { db } from "../db/index.js";
import { users, sessions } from "../db/schema.js";
import { eq } from "drizzle-orm";

export async function checkAuth(req, res, next) {
    const sessionId = req.cookies.blog_session;

    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.session_id, sessionId))
      .limit(1);

    if (!session || session.expires_at <= new Date()) {
      return res.status(401).json({
        error: "invalid session",
      });
    }

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
      })
      .from(users)
      .where(eq(users.id, session.user_id))
      .limit(1);

    if (!user) {
      return res.status(401).json({
        error: "invalid session",
      });
    }

    req.current_user = user;

     next();
  
}