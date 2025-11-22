import { count, eq } from "drizzle-orm";
import { db } from "../../database/db";
import { commentsTable, followersTable } from "../../database";
import { setCommentDetails } from "../../helpers/details/comment";
import { COMMENT_WEIGHT } from "../weights";

export async function commentImpact(userId: string) {
  const [followers] = await db
    .select({ count: count() })
    .from(followersTable)
    .where(eq(followersTable.following, userId));

  const comments = await db
    .select()
    .from(commentsTable)
    .where(eq(commentsTable.createdBy, userId));
  let rep = 0;
  for (const comment of comments) {
    await setCommentDetails(comment);
    rep += (comment as any).votes;
  }

  return (followers.count + rep) / 5 + COMMENT_WEIGHT;
}
