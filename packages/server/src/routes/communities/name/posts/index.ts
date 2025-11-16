import express from "express";
import { requireAuth } from "../../../../helpers/middlewares/Auth";
import BodyValidationMiddleware from "../../../../helpers/middlewares/BodyValidation";
import { createPostSchema } from "../../../../helpers/validations/communities/comment/create";
import { db } from "../../../../database/db";
import {
  commentsTable,
  communitiesTable,
  voteTable,
} from "../../../../database";
import { and, count, desc, eq, gte, not } from "drizzle-orm";
import post from "../../../../helpers/db/selects/post";
import CanAccessCommunity from "../../../../helpers/middlewares/CanAccessCommunity";
import QueryValidationMiddleware from "../../../../helpers/middlewares/QueryValidation";
import z from "zod";
const router = express.Router();

router.get(
  "/:name/posts",
  CanAccessCommunity,
  (req, res, next) =>
    QueryValidationMiddleware(
      req,
      res,
      next,
      z.object({
        sort: z.enum(["best"]).optional().default("best"),
      })
    ),
  async (req, res) => {
    const { name } = req.params;
    const [findCommunity] = await db
      .select()
      .from(communitiesTable)
      .where(eq(communitiesTable.name, name));

    const { sort } = req.query;

    if (sort == "best") {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      const posts = await db
        .select({ ...post, comments: count(commentsTable.relatedTo) })
        .from(commentsTable)
        .where(
          and(
            eq(commentsTable.communityId, findCommunity.id),
            eq(commentsTable.post, true),
            gte(commentsTable.createdAt, d)
          )
        )
        .leftJoin(
          voteTable,
          and(
            eq(voteTable.commentId, commentsTable.id),
            eq(voteTable.userId, req.user?.id || "")
          )
        )
        .groupBy(commentsTable.id)
        .orderBy(desc(commentsTable.score));
      return res.status(200).json(posts);
    }
  }
);

router.post(
  "/:name/posts",
  requireAuth,
  CanAccessCommunity,
  (req, res, next) =>
    BodyValidationMiddleware(req, res, next, createPostSchema),
  async (req, res) => {
    const { title, content, tags, attachments } = req.body;
    const { name } = req.params;
    const [findCommunity] = await db
      .select()
      .from(communitiesTable)
      .where(eq(communitiesTable.name, name));

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

  return res.status(200).json({ post: findPost, replies });
});

export default router;
