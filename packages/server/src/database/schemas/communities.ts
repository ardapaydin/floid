import {
  boolean,
  int,
  json,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import createId from "../../helpers/id/createId";
import { sql } from "drizzle-orm";
import { usersTable } from "./users";

export const communitiesTable = mysqlTable("communities", {
  id: varchar("id", { length: 36 })
    .notNull()
    .primaryKey()
    .$default(() => createId()),
  name: varchar("name", { length: 36 }).notNull(),
  icon: varchar("icon", { length: 255 }),
  banner: varchar("banner", { length: 255 }),
  description: varchar("description", { length: 2048 }),
  creator: varchar("creator", { length: 36 }).notNull(),
  visibility: varchar("visibility", {
    length: 36,
    enum: ["public", "private"],
  })
    .notNull()
    .default("private"),
  disabled: boolean("disabled").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const communityMembersTable = mysqlTable("community_members", {
  id: varchar("id", { length: 36 })
    .notNull()
    .primaryKey()
    .$default(() => createId()),
  communityId: varchar("community_id", { length: 36 })
    .notNull()
    .references(() => communitiesTable.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 36 })
    .default("member")
    .$type<"member" | "mod" | "owner">(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at").defaultNow(),
});
