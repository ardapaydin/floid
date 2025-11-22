import { sql } from "drizzle-orm";

export const mul = (a: any, b: number) => sql`(${a} * ${b})`;
