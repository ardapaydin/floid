import { int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import { usersTable } from "./users";

export const usedReputationsTable = mysqlTable("used_reputations", {
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .primaryKey()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  used: int("used"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
