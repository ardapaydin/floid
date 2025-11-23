import { mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import createId from "../../helpers/id/createId";
import { usersTable } from "./users";

export const blockedUsersTable = mysqlTable("blocked_users", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .notNull()
    .$default(() => createId()),
  blockedBy: varchar("blocked_by", { length: 36 })
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  blockedUser: varchar("blocked_user", { length: 36 })
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
