import { mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import createId from "../../helpers/id/createId";
import { usersTable } from "./users";

export const attachmentsTable = mysqlTable("attachments", {
  id: varchar("id", { length: 36 })
    .notNull()
    .$default(() => createId())
    .primaryKey(),
  uploadedBy: varchar("uploaded_by", { length: 36 })
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 36 }).notNull(),
  uuid: varchar("uuid", { length: 36 }).notNull(),
  key: varchar("key", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
