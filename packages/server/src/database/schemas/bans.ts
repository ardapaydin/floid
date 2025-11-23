import { mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import createId from "../../helpers/id/createId";
import { usersTable } from "./users";
import { communitiesTable } from "./communities";

export const banTable = mysqlTable("bans", {
  id: varchar("id", { length: 32 })
    .$default(() => createId())
    .notNull()
    .primaryKey(),
  userId: varchar("user_id", { length: 32 })
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  communityId: varchar("community_id", { length: 32 })
    .references(() => communitiesTable.id, { onDelete: "cascade" })
    .notNull(),
  bannedBy: varchar("banned_by", { length: 32 }).references(
    () => usersTable.id,
    { onDelete: "cascade" }
  ),
  reason: varchar("reason", { length: 255 }),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
