import express from "express";
import { requireAuth } from "../../../../helpers/middlewares/Auth";
import BodyValidationMiddleware from "../../../../helpers/middlewares/BodyValidation";
import { createPostSchema } from "../../../../helpers/validations/communities/post/create";
import { db } from "../../../../database/db";
import {
  attachmentsTable,
  blockedUsersTable,
  commentsTable,
  communitiesTable,
  voteTable,
} from "../../../../database";
import { and, count, desc, eq, gte, inArray, isNull } from "drizzle-orm";
import post from "../../../../helpers/db/selects/post";
import CanAccessCommunity from "../../../../helpers/middlewares/CanAccessCommunity";
import QueryValidationMiddleware from "../../../../helpers/middlewares/QueryValidation";
import z from "zod";
import idRouter from "./id";
import { setCommentDetails } from "../../../../helpers/details/comment";
import { calculate } from "../../../../algorithm/calculate/calculate";
const router = express.Router();
router.use(idRouter);

router.get(
  "/:name/posts",
  CanAccessCommunity,
  (req, res, next) =>
    QueryValidationMiddleware(
      req,
      res,
      next,
      z.object({
        sort: z.enum(["best", "new"]).optional().default("best"),
        limit: z
          .string()
          .transform((val) => parseInt(val))
          .optional(),
        offset: z
          .string()
          .transform((val) => parseInt(val))
          .optional(),
      })
    ),
  async (req, res) => {
    const { name } = req.params;
    const [findCommunity] = await db
      .select()
      .from(communitiesTable)
      .where(eq(communitiesTable.name, name));

    let { sort, limit, offset } = req.query;
    if (!limit) limit = "10";
    if (!offset) offset = "0";
    let posts: any[] = [];
    const d = new Date();
    d.setDate(d.getDate() - 30);

    if (sort == "best") {
      posts = await db
        .select({ ...post, comments: count(commentsTable.relatedTo) })
        .from(commentsTable)
        .leftJoin(
          blockedUsersTable,
          and(
            eq(blockedUsersTable.blockedBy, req.user?.id || ""),
            eq(blockedUsersTable.blockedUser, commentsTable.createdBy)
          )
        )
        .where(
          and(
            eq(commentsTable.communityId, findCommunity.id),
            eq(commentsTable.post, true),
            eq(commentsTable.deleted, false),
            gte(commentsTable.createdAt, d),
            isNull(blockedUsersTable.blockedUser)
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
        .orderBy(desc(commentsTable.score))
        .limit(Math.min(Number(limit), 30))
        .offset(Number(offset));
    }

    if (sort == "new") {
      posts = await db
        .select({ ...post, comments: count(commentsTable.relatedTo) })
        .from(commentsTable)
        .leftJoin(
          blockedUsersTable,
          and(
            eq(blockedUsersTable.blockedBy, req.user?.id || ""),
            eq(blockedUsersTable.blockedUser, commentsTable.createdBy)
          )
        )
        .where(
          and(
            eq(commentsTable.communityId, findCommunity.id),
            eq(commentsTable.post, true),
            eq(commentsTable.deleted, false),
            isNull(blockedUsersTable.blockedUser)
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
        .orderBy(desc(commentsTable.createdAt))
        .limit(Math.min(Number(limit), 30))
        .offset(Number(offset));
    }

    const [{ count: totalComments }] = await db
      .select({ count: count() })
      .from(commentsTable)
      .where(
        and(
          eq(commentsTable.communityId, findCommunity.id),
          eq(commentsTable.post, true),
          eq(commentsTable.deleted, false),
          sort == "best" ? gte(commentsTable.createdAt, d) : undefined
        )
      );

    for (const post of posts) await setCommentDetails(post);

    return res.status(200).json({
      posts,
      pagination: {
        totalItems: totalComments,
        currentPage: Math.floor(Number(offset) / Number(limit)) + 1,
        totalPages: Math.ceil(totalComments / Number(limit)),
        itemsPerPage: Number(limit),
        hasNextPage: Number(offset) + Number(limit) < totalComments,
        hasPreviousPage: Number(offset) > 0,
      },
    });
  }
);

router.post(
  "/:name/posts",
  requireAuth,
  CanAccessCommunity,
  (req, res, next) =>
    BodyValidationMiddleware(req, res, next, createPostSchema),
  async (req, res) => {
    let { title, content, tags, attachments } = req.body;
    const { name } = req.params;
    const [findCommunity] = await db
      .select()
      .from(communitiesTable)
      .where(eq(communitiesTable.name, name));
    attachments = [...new Set(attachments)];
    const findattachments = await db
      .select()
      .from(attachmentsTable)
      .where(
        and(
          inArray(attachmentsTable.id, attachments),
          eq(attachmentsTable.type, "attachments"),
          eq(attachmentsTable.uploadedBy, req.user?.id!)
        )
      );

    if (findattachments.length != attachments.length)
      return res.status(400).json({
        success: false,
        message: "One or more attachments do not exist",
      });

    const [{ id }] = await db
      .insert(commentsTable)
      .values({
        title,
        content,
        tags,
        attachments: findattachments.map((attachment) => ({
          id: attachment.id,
          url: attachment.key,
        })),
        communityId: findCommunity.id,
        score: await calculate(req.user!.id),
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

export default router;
