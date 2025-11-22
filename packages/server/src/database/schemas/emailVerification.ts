import {
  boolean,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import createId from "../../helpers/id/createId";
import { usersTable } from "./users";

export const emailVerificationTable = mysqlTable("email_verification", {
  id: varchar("id", { length: 32 })
    .$default(() => createId())
    .notNull()
    .primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  email: varchar("email", { length: 255 }).notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
