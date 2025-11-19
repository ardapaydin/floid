import { and, count, eq } from "drizzle-orm";
import { commentsTable, voteTable } from "../../database";
import { db } from "../../database/db";

export async function setCommentDetails(comment: any) {
  (comment as any).comments = (
    await db
      .select({ s: count() })
      .from(commentsTable)
      .where(eq(commentsTable.relatedTo, comment.id))
  )?.[0].s;

  const allvotes = await db
    .select()
    .from(voteTable)
    .where(eq(voteTable.commentId, comment.id));
  const total =
    allvotes.filter((x) => x.type == "up").length -
    allvotes.filter((x) => x.type == "down").length;
  (comment as any).votes = total;
  return comment;
}
