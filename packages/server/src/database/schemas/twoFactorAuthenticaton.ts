import {
  boolean,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import createId from "../../helpers/id/createId";
import { usersTable } from "./users";

export const twoFactorAuthenticatonTable = mysqlTable(
  "two_factor_authenticaton",
  {
    id: varchar("id", { length: 32 })
      .notNull()
      .primaryKey()
      .$default(() => createId()),
    userId: varchar("user_id", { length: 32 })
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    secret: varchar("secret", { length: 255 }).notNull(),
    verified: boolean("verified").default(false).notNull(),
    lastUsedAt: timestamp("last_used_at").defaultNow(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  }
);
