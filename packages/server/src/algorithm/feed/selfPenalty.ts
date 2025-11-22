import { sql } from "drizzle-orm";
import { caseWhen } from "../../database/custom/dcase";
import { when } from "../../database/custom/when";
import { commentsTable } from "../../database";
import { SELF_COMMENT_PENALTY_WEIGHT } from "../weights";

export const selfPenalty = (userId: string) =>
  caseWhen([
    when(
      sql`${commentsTable.createdBy} = ${userId}`,
      sql`${commentsTable.score} * ${SELF_COMMENT_PENALTY_WEIGHT}`
    ),
  ]);
