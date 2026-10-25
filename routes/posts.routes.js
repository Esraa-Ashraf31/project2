import express from "express";
import { checkAuth } from "../middleware/checkAuth.js";
import { validateBody } from "../middleware/validateBody.js";
import { uploadImage } from "../middleware/upload.js";

import {createPostSchema,createCommentSchema,} from "../validation-schemas/posts.js";

import { getAllPosts, getPostById, postExists, createPost, togglePostLike,} from "../queries/post.queries.js";

import {getCommentsByPostId,createComment,} from "../queries/comment.queries.js";

export const postsRouter = express.Router();

// GET /api/posts
postsRouter.get("/", checkAuth, async (req, res, next) => {

    const data = await getAllPosts(req.current_user.id);
    return res.status(200).json({ data });
});

// POST /api/posts
postsRouter.post(
  "/",
  checkAuth,
  uploadImage("image"),
  validateBody(createPostSchema),
  async (req, res, next) => {
      const post = await createPost({
        userId: req.current_user.id,
        content: req.body.content,
        image: req.file?.filename ?? null,
      });

      return res.status(201).json({
        message: "post created successfully",
        data: post,
      });
  },
);

// GET /api/posts/:id
postsRouter.get("/:id", checkAuth, async (req, res, next) => {
    const postId = Number(req.params.id)

    if (!postId) {
      return res.status(404).json({ error: "post not found" });
    }

    const post = await getPostById(postId, req.current_user.id);

    if (!post) {
      return res.status(404).json({ error: "post not found" });
    }

    const comments = await getCommentsByPostId(postId);

    return res.status(200).json({
      data: {
        post,
        comments,
      },
    });
});

// POST /api/posts/:id/like
postsRouter.post("/:id/like", checkAuth, async (req, res, next) => {
    const postId = Number(req.params.id)

    if (!postId || !(await postExists(postId))) {
      return res.status(404).json({ error: "post not found" });
    }

    const data = await togglePostLike(postId, req.current_user.id);

    return res.status(200).json({ data });
});

// POST /api/posts/:id/comments
postsRouter.post(
  "/:id/comments",
  checkAuth,
  validateBody(createCommentSchema),
  async (req, res, next) => {
      const postId = Number(req.params.id)

      if (!postId || !(await postExists(postId))) {
        return res.status(404).json({ error: "post not found" });
      }

      const data = await createComment({ postId, userId: req.current_user.id, content: req.body.content,});

      return res.status(201).json({
        message: "comment created successfully",
        data,
      });
  },
);