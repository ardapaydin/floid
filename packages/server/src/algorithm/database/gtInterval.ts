import { Column, sql } from "drizzle-orm";

export const gtInterval = (column: Column, hours: number) =>
  sql`${column} > NOW() - INTERVAL ${hours} HOUR`;
