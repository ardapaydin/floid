import express from "express";
import {
  bookmarksTable,
  commentsTable,
  communitiesTable,
  voteTable,
} from "../../../../../database";
import { db } from "../../../../../database/db";
import { and, count, eq } from "drizzle-orm";
import post from "../../../../../helpers/db/selects/post";
import CanAccessCommunity from "../../../../../helpers/middlewares/CanAccessCommunity";
import { requireAuth } from "../../../../../helpers/middlewares/Auth";
import { setCommentDetails } from "../../../../../helpers/details/comment";
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
    .leftJoin(
      bookmarksTable,
      and(
        eq(bookmarksTable.userId, req.user?.id || ""),
        eq(bookmarksTable.postId, commentsTable.id)
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
    .leftJoin(
      bookmarksTable,
      and(
        eq(bookmarksTable.userId, req.user?.id || ""),
        eq(bookmarksTable.postId, commentsTable.id)
      )
    )
    .where(
      and(eq(commentsTable.relatedTo, postId), eq(commentsTable.post, false))
    );
  await setCommentDetails(findPost);
  for (const post of replies) await setCommentDetails(post);

  return res.status(200).json({ post: findPost, replies });
});

router.post(
  "/:name/posts/:postId/save",
  requireAuth,
  CanAccessCommunity,
  async (req, res) => {
    const { name, postId } = req.params;
    const [community] = await db
      .select()
      .from(communitiesTable)
      .where(eq(communitiesTable.name, name));

    const [findPost] = await db
      .select()
      .from(commentsTable)
      .where(
        and(
          eq(commentsTable.id, postId),
          eq(commentsTable.communityId, community.id)
        )
      );

    if (!findPost)
      return res
        .status(404)
        .json({ success: false, message: "post not found." });
    if (!findPost.post)
      return res
        .status(400)
        .json({ success: false, message: "cannot save comments" });

    const [saved] = await db
      .select()
      .from(bookmarksTable)
      .where(
        and(
          eq(bookmarksTable.userId, req.user!.id),
          eq(bookmarksTable.postId, postId)
        )
      );
    if (saved)
      return res.status(409).json({ success: false, message: "already saved" });

    await db.insert(bookmarksTable).values({
      userId: req.user!.id,
      postId,
    });

    return res.status(200).json({ success: true });
  }
);

router.delete("/:name/posts/:postId/save", requireAuth, async (req, res) => {
  const { postId, name } = req.params;
  const [community] = await db
    .select()
    .from(communitiesTable)
    .where(eq(communitiesTable.name, name));
  const [post] = await db
    .select()
    .from(commentsTable)
    .where(
      and(
        eq(commentsTable.communityId, community.id),
        eq(commentsTable.id, postId),
        eq(commentsTable.post, true)
      )
    );
  if (!post)
    return res.status(404).json({ success: false, message: "post not found" });
  const [del] = await db
    .delete(bookmarksTable)
    .where(
      and(
        eq(bookmarksTable.userId, req.user!.id),
        eq(bookmarksTable.postId, postId)
      )
    );

  if (!del.affectedRows)
    return res
      .status(400)
      .json({ success: false, message: "this post is not saved" });

  return res.status(200).json({ success: true });
});

export default router;
