import bcrypt from "bcrypt";
import crypto from "node:crypto";
import express from "express";
import { getUserByEmail, createUser, createSession, deleteSession } from "../queries/auth.queries.js";

import { validateBody } from "../middleware/validateBody.js";
import { registerSchema, loginSchema } from "../validation-schemas/auth.js";
import { checkAuth } from "../middleware/checkAuth.js";

export const authRouter = express.Router();

/////////////////////////////////// REGISTER ///////////////////////////////////

authRouter.post("/register",validateBody(registerSchema),async (req, res) => {
      const existingUser = await getUserByEmail(req.body.email);
      if (existingUser) {
        return res.status(422).json({
          errors: {
            email: {
              errors: ["email already in use"],
            },
          },
        });
      }
      const password_hash = await bcrypt.hash(req.body.password, 10);

      await createUser({
        username: req.body.username,
        email: req.body.email,
        password_hash,
      });

      return res.status(201).json({
        message: "register successful, you can now login",
      });
    
  }
);

/////////////////////////////////////LOGIN //////////////////////////////

authRouter.post("/login",validateBody(loginSchema),async (req, res) => {
      const existingUser = await getUserByEmail(req.body.email);

      if (!existingUser) {
        return res.status(401).json({
          error: "invalid email or password",
        });
      }

      const isValid = await bcrypt.compare(
        req.body.password,
        existingUser.password_hash
      );

      if (!isValid) {
        return res.status(401).json({
          error: "invalid email or password",
        });
      }

      const session_id = crypto.randomBytes(32).toString("hex");

      const expires_at = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      );

      await createSession({
        session_id,
        user_id: existingUser.id,
        expires_at,
      });

      res.cookie("blog_session", session_id, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        message: "login successful",
        data: {
          user: {
            id: existingUser.id,
            email: existingUser.email,
            username: existingUser.username,
          },
        },
      });
  }
);

///////////////////////////////////LOGOUT ////////////////////////////

authRouter.post("/logout", async (req, res) => {
    const session_id = req.cookies.blog_session;

    if (session_id) {
      await deleteSession(session_id);
    }

    res.clearCookie("blog_session", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({
      message: "logout successful",
    });
});

// ///////////////////////// ME //////////////////////////////////

authRouter.get("/me", checkAuth, (req, res) => {
  return res.status(200).json({
    data: {
      user: req.current_user,
    },
  });
});

