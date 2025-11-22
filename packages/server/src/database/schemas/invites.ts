import { int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import createId from "../../helpers/id/createId";
import { communitiesTable } from "./communities";
import { usersTable } from "./users";

export const invitesTable = mysqlTable("invites", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .notNull()
    .$default(() => createId()),
  communityId: varchar("community_id", { length: 36 })
    .notNull()
    .references(() => communitiesTable.id, { onDelete: "cascade" }),
  createdBy: varchar("created_by", { length: 36 })
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  uses: int("uses").default(0).notNull(),
  maxUses: int("max_uses").default(50).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
