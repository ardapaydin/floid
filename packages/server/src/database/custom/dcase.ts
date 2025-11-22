import { sql, SQL } from "drizzle-orm";

export const caseWhen = (whens: SQL[], elseVal: SQL | number | string = 0) => {
  return sql`CASE ${sql.join(whens, sql.raw(" "))} ELSE ${elseVal} END`;
};
