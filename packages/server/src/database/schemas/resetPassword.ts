import {
  boolean,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import createId from "../../helpers/id/createId";
import { usersTable } from "./users";

export const resetPasswordTable = mysqlTable("reset_password", {
  id: varchar("id", { length: 32 })
    .notNull()
    .primaryKey()
    .$default(() => createId()),
  userId: varchar("user_id", { length: 32 })
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  email: varchar("email", { length: 255 }).notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
