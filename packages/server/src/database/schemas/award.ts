import { mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import createId from "../../helpers/id/createId";
import { commentsTable } from "./comments";
import { usersTable } from "./users";

export const awardTable = mysqlTable("awards", {
  id: varchar("id", { length: 36 })
    .notNull()
    .primaryKey()
    .$default(() => createId()),
  commentId: varchar("comment_id", { length: 36 })
    .notNull()
    .references(() => commentsTable.id, { onDelete: "cascade" }),
  awardedBy: varchar("awarded_by", { length: 36 })
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  awardedTo: varchar("awarded_to", { length: 36 })
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  gived: varchar("gived", { length: 36 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
