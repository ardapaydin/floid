import { mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import createId from "../../helpers/id/createId";
import { usersTable } from "./users";

export const followersTable = mysqlTable("followers", {
  id: varchar("id", { length: 36 })
    .notNull()
    .primaryKey()
    .$default(() => createId()),
  userId: varchar("user_id", { length: 36 })
    .references(() => usersTable.id, {
      onDelete: "cascade",
    })
    .notNull(),
  following: varchar("following", { length: 36 })
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
