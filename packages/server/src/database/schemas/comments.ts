import {
  boolean,
  float,
  int,
  json,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import createId from "../../helpers/id/createId";
import { usersTable } from "./users";
import { communitiesTable } from "./communities";
import { customJson } from "../custom/json";
import { sql } from "drizzle-orm";

export const commentsTable = mysqlTable("comments", {
  id: varchar("id", { length: 36 })
    .notNull()
    .$default(() => createId())
    .primaryKey(),
  title: varchar("title", { length: 300 }),
  content: varchar("content", { length: 10240 }),
  tags: customJson("tags")
    .default(sql`'[]'`)
    .notNull(),
  attachments: customJson("attachments")
    .default(sql`'[]'`)
    .notNull(),
  createdBy: varchar("created_by", { length: 36 }).references(
    () => usersTable.id,
    { onDelete: "cascade" }
  ),
  communityId: varchar("community_id", { length: 36 }).references(
    () => communitiesTable.id,
    { onDelete: "cascade" }
  ),
  replyTo: varchar("reply_to", { length: 36 }).references(
    (): any => commentsTable.id,
    { onDelete: "cascade" }
  ),
  relatedTo: varchar("related_to", { length: 36 }).references(
    (): any => commentsTable.id,
    {
      onDelete: "cascade",
    }
  ),
  post: boolean("post").default(true),
  deleted: boolean("deleted").default(false),
  score: float("score").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const voteTable = mysqlTable("votes", {
  id: varchar("id", { length: 36 })
    .notNull()
    .$default(() => createId())
    .primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  commentId: varchar("comment_id", { length: 36 })
    .notNull()
    .references(() => commentsTable.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 36 }).notNull().$type<"up" | "down">(),
  createdAt: timestamp("created_at").defaultNow(),
});
