import {pgTable,serial,integer,text,varchar,timestamp,primaryKey,} from "drizzle-orm/pg-core";

import { defineRelations } from "drizzle-orm";


//////////////////////////// USERS ///////////////////////////////////

export const users = pgTable("users", {
  id: serial("id").primaryKey(),

  username: varchar("username", { length: 255 }).notNull(),

  email: varchar("email", { length: 255 }).notNull().unique(),

  password_hash: text("password_hash").notNull(),

  created_at: timestamp("created_at", { withTimezone: true,}) .defaultNow(),
});

/////////////////////////// SESSIONS /////////////////////////////////

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),

  session_id: varchar("session_id", { length: 64 }).unique(),

  user_id: integer("user_id") .notNull() .references(() => users.id, { onDelete: "cascade" }),

  expires_at: timestamp("expires_at", { withTimezone: true,}).notNull(),

  created_at: timestamp("created_at", { withTimezone: true,}) .defaultNow() .notNull(),
});

////////////////////////////////////////// POSTS ///////////////////////////////////

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),

  user_id: integer("user_id") .notNull() .references(() => users.id, { onDelete: "cascade" }),

  content: text("content").notNull(),

  image: text("image"),

  created_at: timestamp("created_at", { withTimezone: true,}) .defaultNow() .notNull(),
});

/////////////////////////////////// COMMENTS ///////////////////////////////////////////

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),

  post_id: integer("post_id") .notNull() .references(() => posts.id, { onDelete: "cascade" }),

  user_id: integer("user_id") .notNull() .references(() => users.id, { onDelete: "cascade" }),

  content: text("content").notNull(),

  created_at: timestamp("created_at", { withTimezone: true,}).defaultNow().notNull(),
});

//////////////////////////////////////// LIKES /////////////////////////////////

export const likes = pgTable("likes",
  {
    user_id: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

    post_id: integer("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),

    created_at: timestamp("created_at", {withTimezone: true, }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.user_id, table.post_id],
    }),
  ]
);

export const relations = defineRelations(
  {
    users,
    sessions,
    posts,
    comments,
    likes,
  },
  (r) => ({
    users: {
      sessions: r.many.sessions(),
      posts: r.many.posts(),
      comments: r.many.comments(),
      likes: r.many.likes(),
    },

    sessions: {
      user: r.one.users({
        from: r.sessions.user_id,
        to: r.users.id,
      }),
    },

    posts: {
      user: r.one.users({
        from: r.posts.user_id,
        to: r.users.id,
      }),

      comments: r.many.comments(),
      likes: r.many.likes(),
    },

    comments: {
      user: r.one.users({
        from: r.comments.user_id,
        to: r.users.id,
      }),

      post: r.one.posts({
        from: r.comments.post_id,
        to: r.posts.id,
      }),
    },

    likes: {
      user: r.one.users({
        from: r.likes.user_id,
        to: r.users.id,
      }),

      post: r.one.posts({
        from: r.likes.post_id,
        to: r.posts.id,
      }),
    },
  }),
);





