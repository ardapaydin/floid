import {
  boolean,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import createId from "../../helpers/id/createId";
import { usersTable } from "./users";
import { twoFactorAuthenticatonTable } from "./twoFactorAuthenticaton";

export const backupCodesTable = mysqlTable("backup_codes", {
  id: varchar("id", { length: 32 })
    .notNull()
    .primaryKey()
    .$default(() => createId()),
  userId: varchar("user_id", { length: 32 })
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  twoFaId: varchar("two_fa_id", { length: 32 })
    .notNull()
    .references(() => twoFactorAuthenticatonTable.id, { onDelete: "cascade" }),
  key: varchar("key", { length: 32 }).notNull(),
  used: boolean("used").default(false),
  usedAt: timestamp("used_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
