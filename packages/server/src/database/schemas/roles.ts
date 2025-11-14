import { mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import createId from "../../helpers/id/createId";
import { communitiesTable } from "./communities";

export const rolesTable = mysqlTable("roles", {
  id: varchar("id", { length: 36 })
    .notNull()
    .primaryKey()
    .$default(() => createId()),
  name: varchar("name", { length: 255 }).notNull(),
  flair: varchar("flair", { length: 16 }),
  communityId: varchar("community_id", { length: 36 })
    .notNull()
    .references(() => communitiesTable.id, { onDelete: "cascade" }),
  permissions: varchar("permissions", { length: 255 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
