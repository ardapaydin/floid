import express from "express";
import { requireAuth } from "../../../../helpers/middlewares/Auth";
import BodyValidationMiddleware from "../../../../helpers/middlewares/BodyValidation";
import { createPostSchema } from "../../../../helpers/validations/communities/comment/create";
import { db } from "../../../../database/db";
import {
  commentsTable,
  communitiesTable,
  communityMembersTable,
  voteTable,
} from "../../../../database";
import { and, eq } from "drizzle-orm";
import post from "../../../../helpers/db/selects/post";
const router = express.Router();

router.post(
  "/:name/posts",
  requireAuth,
  (req, res, next) =>
    BodyValidationMiddleware(req, res, next, createPostSchema),
  async (req, res) => {
    const { title, content, tags, attachments } = req.body;
    const { name } = req.params;
    const [findCommunity] = await db
      .select()
      .from(communitiesTable)
      .where(eq(communitiesTable.name, name));

    if (!findCommunity)
      return res
        .status(404)
        .json({ success: false, message: "Community not found." });

    if (
      findCommunity.visibility == "private" &&
      !(
        await db
          .select()
          .from(communityMembersTable)
          .where(
            and(
              eq(communityMembersTable.userId, req.user!.id),
              eq(communityMembersTable.communityId, findCommunity.id)
            )
          )
      )?.[0]
    )
      return res
        .status(404)
        .json({ success: false, message: "Community not found." });
    const [{ id }] = await db
      .insert(commentsTable)
      .values({
        title,
        content,
        tags,
        attachments,
        communityId: findCommunity.id,
        score: 0,
        createdBy: req.user!.id,
        post: true,
      })
      .$returningId();

    await db.insert(voteTable).values({
      commentId: id,
      userId: req.user!.id,
      type: "up",
    });

    return res
      .status(200)
      .json({ success: true, data: { id, title, content, attachments, tags } });
  }
);

router.get("/:name/posts/:postId", async (req, res) => {
  const { name, postId } = req.params;
  const [findCommunity] = await db
    .select()
    .from(communitiesTable)
    .where(eq(communitiesTable.name, name));

  if (!findCommunity)
    return res
      .status(404)
      .json({ success: false, message: "Community not found." });

  if (
    findCommunity.visibility == "private" &&
    (!req.user?.id ||
      (
        await db
          .select()
          .from(communityMembersTable)
          .where(
            and(
              eq(communityMembersTable.userId, req.user.id),
              eq(communityMembersTable.communityId, findCommunity.id)
            )
          )
      )?.[0])
  )
    return res
      .status(404)
      .json({ success: false, message: "Community not found." });

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

  return res.status(200).json({ post: findPost, replies });
});

export default router;
