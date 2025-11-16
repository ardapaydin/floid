import express from "express";
import {
  commentsTable,
  communitiesTable,
  voteTable,
} from "../../../../../database";
import { db } from "../../../../../database/db";
import { and, count, eq } from "drizzle-orm";
import post from "../../../../../helpers/db/selects/post";
import CanAccessCommunity from "../../../../../helpers/middlewares/CanAccessCommunity";
const router = express.Router();

router.get("/:name/posts/:postId", CanAccessCommunity, async (req, res) => {
  const { name, postId } = req.params;
  const [findCommunity] = await db
    .select()
    .from(communitiesTable)
    .where(eq(communitiesTable.name, name));

  const [findPost] = await db
    .select(post)
    .from(commentsTable)
    .leftJoin(
      voteTable,
      and(
        eq(voteTable.commentId, commentsTable.id),
        eq(voteTable.userId, req.user?.id || "")
      )
    )
    .where(
      and(
        eq(commentsTable.id, postId),
        eq(commentsTable.post, true),
        eq(commentsTable.communityId, findCommunity.id)
      )
    );
  if (!findPost)
    return res.status(404).json({ success: false, message: "Post not found" });
  const replies = await db
    .select(post)
    .from(commentsTable)
    .leftJoin(
      voteTable,
      and(
        eq(voteTable.commentId, commentsTable.id),
        eq(voteTable.userId, req.user?.id || "")
      )
    )
    .where(
      and(eq(commentsTable.relatedTo, postId), eq(commentsTable.post, false))
    );
  (findPost as any).comments = (
    await db
      .select({ s: count() })
      .from(commentsTable)
      .where(eq(commentsTable.relatedTo, findPost.id))
  )?.[0].s;

  const allvotes = await db
    .select()
    .from(voteTable)
    .where(eq(voteTable.commentId, findPost.id));
  const total =
    allvotes.filter((x) => x.type == "up").length -
    allvotes.filter((x) => x.type == "down").length;
  (findPost as any).votes = total;

  for (const post of replies) {
    (post as any).comments = (
      await db
        .select({ s: count() })
        .from(commentsTable)
        .where(eq(commentsTable.relatedTo, post.id))
    )?.[0].s;

    const allvotes = await db
      .select()
      .from(voteTable)
      .where(eq(voteTable.commentId, post.id));
    const total =
      allvotes.filter((x) => x.type == "up").length -
      allvotes.filter((x) => x.type == "down").length;
    (post as any).votes = total;
  }

  return res.status(200).json({ post: findPost, replies });
});

export default router;
