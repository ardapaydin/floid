import { SQL, sql } from "drizzle-orm";

export const when = (
  cond: SQL | boolean,
  val: SQL | number | string
): SQL<unknown> => sql`WHEN ${cond} THEN ${val}`;
