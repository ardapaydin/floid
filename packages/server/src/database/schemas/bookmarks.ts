import { mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import createId from "../../helpers/id/createId";
import { usersTable } from "./users";
import { commentsTable } from "./comments";

export const bookmarksTable = mysqlTable("bookmarks", {
  id: varchar("id", { length: 36 })
    .notNull()
    .primaryKey()
    .$default(() => createId()),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  postId: varchar("post_id", { length: 36 })
    .notNull()
    .references(() => commentsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});
