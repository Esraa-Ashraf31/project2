import express from "express";
import { pagesRouter } from "./routes/pages.routes.js";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth.routes.js";
import { postsRouter } from "./routes/posts.routes.js";
const app = express();

app.use((req, res, next) => {
  console.log(new Date().toLocaleString(), req.method, req.url);
  next();
});
app.use(express.json());
app.use(cookieParser());

app.use("/uploads", express.static("uploads"));

app.use("/auth", authRouter);
app.use("/api/posts", postsRouter);
app.use(pagesRouter);

app.use((err, req, res, next) => {
  console.log("err", err);
  res.status(500).json({ error: "something went wrong" });
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});
