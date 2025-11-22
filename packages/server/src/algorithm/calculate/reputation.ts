import { eq } from "drizzle-orm";
import { commentsTable } from "../../database";
import { db } from "../../database/db";
import { setCommentDetails } from "../../helpers/details/comment";
import { REPUTATION_WEIGHT } from "../weights";

export async function reputationBoost(userId: string) {
  const comments = await db
    .select()
    .from(commentsTable)
    .where(eq(commentsTable.createdBy, userId));
  let rep = 0;
  for (const comment of comments) {
    await setCommentDetails(comment);
    rep += (comment as any).votes;
  }

  return (rep / 10) * REPUTATION_WEIGHT;
}
