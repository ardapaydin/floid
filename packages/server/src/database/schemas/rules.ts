import { int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import createId from "../../helpers/id/createId";
import { communitiesTable } from "./communities";

export const communityRulesTable = mysqlTable("community_rules", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .notNull()
    .$default(() => createId()),
  communityId: varchar("communityId", { length: 36 })
    .references(() => communitiesTable.id, { onDelete: "cascade" })
    .notNull(),
  content: varchar("content", { length: 255 }),
  priority: int("priority").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
