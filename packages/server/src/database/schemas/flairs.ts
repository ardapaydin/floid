import {
  boolean,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import createId from "../../helpers/id/createId";
import { communitiesTable } from "./communities";
import { usersTable } from "./users";

export const flairTable = mysqlTable("flairs", {
  id: varchar("id", { length: 36 })
    .notNull()
    .primaryKey()
    .$default(() => createId()),
  flair: varchar("flair", { length: 32 }).notNull(),
  modOnly: boolean("mod_only").default(false),
  communityId: varchar("community_id", { length: 32 })
    .references(() => communitiesTable.id, { onDelete: "cascade" })
    .notNull(),
  color: varchar("color", { length: 32 }).notNull(),
  createdBy: varchar("created_by", { length: 32 })
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
