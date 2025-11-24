import express from "express";
import { requireAuth } from "../../../../../helpers/middlewares/Auth";
import CanAccessCommunity from "../../../../../helpers/middlewares/CanAccessCommunity";
import BodyValidationMiddleware from "../../../../../helpers/middlewares/BodyValidation";
import z from "zod";
import { db } from "../../../../../database/db";
import {
  bookmarksTable,
  commentsTable,
  communitiesTable,
  voteTable,
} from "../../../../../database";
import { and, eq } from "drizzle-orm";
import { createCommentSchema } from "../../../../../helpers/validations/communities/comment/create";
import post from "../../../../../helpers/db/selects/post";
import { setCommentDetails } from "../../../../../helpers/details/comment";
import getPermissions from "../../../../../helpers/permissions/getPermissions";
import hasPermission from "../../../../../helpers/permissions/hasPermission";
import { voteImpact } from "../../../../../algorithm/calculate/voteImpact";
import { COMMENT_DELETED_BY_MOD_WEIGHT } from "../../../../../algorithm/weights";
import { commentImpact } from "../../../../../algorithm/calculate/commentImpact";
import BanCheck from "../../../../../helpers/middlewares/BanCheck";
const router = express.Router();

router.post(
  "/:name/comments/:commentId/comment",
  requireAuth,
  CanAccessCommunity,
  BanCheck,
  (req, res, next) =>
    BodyValidationMiddleware(req, res, next, createCommentSchema),
  async (req, res) => {
    const { name, commentId } = req.params;
    const { content } = req.body;

    const [community] = await db
      .select()
      .from(communitiesTable)
      .where(eq(communitiesTable.name, name));

    const [comment] = await db
      .select()
      .from(commentsTable)
      .where(
        and(
          eq(commentsTable.id, commentId),
          eq(commentsTable.communityId, community.id)
        )
      );

    if (!comment)
      return res
        .status(404)
        .json({ success: false, message: "comment not found" });
    if (comment.deleted)
      return res
        .status(400)
        .json({ success: false, message: "cannot reply to deleted comments" });
    const [related] = await db
      .select()
      .from(commentsTable)
      .where(
        and(
          eq(commentsTable.id, comment.post ? comment.id : comment.relatedTo!),
          eq(commentsTable.communityId, community.id)
        )
      );

    if (comment.relatedTo && related.deleted)
      return res
        .status(400)
        .json({ success: false, message: "cannot reply to deleted posts" });

    const [findcomment] = await db
      .select()
      .from(commentsTable)
      .where(
        and(
          eq(commentsTable.createdBy, req.user!.id),
          eq(commentsTable.communityId, community.id),
          eq(
            commentsTable.relatedTo,
            comment.post ? comment.id : comment.relatedTo!
          ),
          eq(commentsTable.post, false)
        )
      );
    if (!findcomment) {
      const impact = await commentImpact(req.user!.id);
      await db
        .update(commentsTable)
        .set({
          score: related.score + impact,
        })
        .where(
          eq(commentsTable.id, comment.post ? comment.id : comment.relatedTo!)
        );
    }

    const [create] = await db
      .insert(commentsTable)
      .values({
        communityId: community.id,
        content,
        createdBy: req.user!.id,
        score: 0,
        post: false,
        replyTo: comment.id,
        relatedTo: comment.post ? comment.id : comment.relatedTo,
      })
      .$returningId();
    let [findPost] = await db
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
          eq(commentsTable.id, create.id),
          eq(commentsTable.post, false),
          eq(commentsTable.communityId, community.id)
        )
      );

    findPost = await setCommentDetails(findPost);

    return res.status(200).json({ success: true, data: findPost });
  }
);

router.post(
  "/:name/comments/:commentId/vote",
  requireAuth,
  CanAccessCommunity,
  (req, res, next) =>
    BodyValidationMiddleware(
      req,
      res,
      next,
      z.object({
        vote: z.enum(["up", "down"]).nullable(),
      })
    ),
  async (req, res) => {
    const { commentId, name } = req.params;
    const { vote } = req.body;
    const [community] = await db
      .select()
      .from(communitiesTable)
      .where(eq(communitiesTable.name, name));
    const [comment] = await db
      .select()
      .from(commentsTable)
      .where(
        and(
          eq(commentsTable.id, commentId),
          eq(commentsTable.communityId, community.id)
        )
      );
    if (!comment)
      return res
        .status(404)
        .json({ success: false, message: "comment not found" });
    if (comment.deleted)
      return res.status(400).json({
        success: false,
        message: "cannot upvote/downvote deleted comments",
      });
    const [findvote] = await db
      .select()
      .from(voteTable)
      .where(
        and(
          eq(voteTable.commentId, commentId),
          eq(voteTable.userId, req.user!.id)
        )
      );

    if (vote) {
      if (!findvote)
        await db.insert(voteTable).values({
          commentId: commentId,
          userId: req.user!.id,
          type: vote,
        });
      else
        await db
          .update(voteTable)
          .set({
            commentId: commentId,
            userId: req.user!.id,
            type: vote,
          })
          .where(
            and(
              eq(voteTable.commentId, commentId),
              eq(voteTable.userId, req.user!.id)
            )
          );
    } else
      await db
        .delete(voteTable)
        .where(
          and(
            eq(voteTable.commentId, commentId),
            eq(voteTable.userId, req.user!.id)
          )
        );
    const impact = await voteImpact(req.user?.id!);

    if (comment.post) {
      let score = comment.score;
      if (findvote) {
        if (findvote.type == "up" && vote == "down") score -= impact * 2;
        if (findvote.type == "down" && vote == "up") score += impact * 2;
        if (findvote.type == "down" && vote == null) score += impact;
        if (findvote.type == "up" && vote == null) score -= impact;
      } else if (vote) {
        if (vote == "up") score += impact;
        if (vote == "down") score -= impact;
      }
      await db
        .update(commentsTable)
        .set({
          score,
        })
        .where(eq(commentsTable.id, comment.id));
    }

    const allvotes = await db
      .select({ type: voteTable.type })
      .from(voteTable)
      .where(eq(voteTable.commentId, commentId));
    const total =
      allvotes.filter((v) => v.type == "up").length -
      allvotes.filter((v) => v.type == "down").length;

    return res.status(200).json({ success: true, data: { votes: total } });
  }
);

router.delete("/:name/comments/:commentId", requireAuth, async (req, res) => {
  const { name, commentId } = req.params;

  const [community] = await db
    .select()
    .from(communitiesTable)
    .where(eq(communitiesTable.name, name));

  const [comment] = await db
    .select()
    .from(commentsTable)
    .where(
      and(
        eq(commentsTable.id, commentId),
        eq(commentsTable.communityId, community.id),
        eq(commentsTable.deleted, false)
      )
    );

  if (!comment)
    return res
      .status(404)
      .json({ success: false, message: "comment not found" });

  const permissions = await getPermissions(req.user?.id, community.id);

  if (
    comment.createdBy != req.user?.id &&
    !hasPermission(permissions, "MANAGE_COMMUNITY")
  )
    return res.status(403).json({
      success: false,
      message: "you dont have permission to delete this comment",
    });

  if (!comment.post && comment.relatedTo && comment.createdBy) {
    const [related] = await db
      .select()
      .from(commentsTable)
      .where(eq(commentsTable.id, comment.relatedTo));

    const impact = await commentImpact(comment.createdBy);
    let del = impact;
    if (
      hasPermission(permissions, "MANAGE_COMMUNITY") &&
      comment.createdBy != req.user?.id
    )
      del = del * COMMENT_DELETED_BY_MOD_WEIGHT;

    await db
      .update(commentsTable)
      .set({
        score: related.score - del,
      })
      .where(eq(commentsTable.id, related.id));
  }

  await db
    .update(commentsTable)
    .set({
      content: null,
      tags: [],
      deleted: true,
      score: -10000,
      createdBy: null,
    })
    .where(eq(commentsTable.id, comment.id));

  return res.status(200).json({ success: true });
});

export default router;
