import { sql } from "drizzle-orm";
import { MySqlColumn } from "drizzle-orm/mysql-core";

export const lower = (column: MySqlColumn) => sql`LOWER(${column}`;
