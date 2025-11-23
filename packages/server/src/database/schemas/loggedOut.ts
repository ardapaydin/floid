import { mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

export const loggedOutTokensTable = mysqlTable("loggedOutTokens", {
  token: varchar("token", { length: 255 }).notNull().primaryKey(),
  loggedOutAt: timestamp("logged_out_at").defaultNow(),
});
