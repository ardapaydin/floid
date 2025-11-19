import express from "express";
import { requireAuth } from "../../../../../helpers/middlewares/Auth";
import CanAccessCommunity from "../../../../../helpers/middlewares/CanAccessCommunity";
import BodyValidationMiddleware from "../../../../../helpers/middlewares/BodyValidation";
import z from "zod";
import { db } from "../../../../../database/db";
import {
  commentsTable,
  communitiesTable,
  voteTable,
} from "../../../../../database";
import { and, eq } from "drizzle-orm";
import { createCommentSchema } from "../../../../../helpers/validations/communities/comment/create";
import post from "../../../../../helpers/db/selects/post";
import { setCommentDetails } from "../../../../../helpers/details/comment";
const router = express.Router();

router.post(
  "/:name/comments/:commentId/comment",
  requireAuth,
  CanAccessCommunity,
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

    const [create] = await db
      .insert(commentsTable)
      .values({
        communityId: community.id,
        content,
        createdBy: req.user!.id,
        score: 0,
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
      .where(
        and(
          eq(commentsTable.id, create.id),
          eq(commentsTable.post, true),
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
    if (vote) {
      const [findvote] = await db
        .select()
        .from(voteTable)
        .where(
          and(
            eq(voteTable.commentId, commentId),
            eq(voteTable.userId, req.user!.id)
          )
        );

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

export default router;
