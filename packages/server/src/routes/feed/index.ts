import express from "express";
import z from "zod";
import { db } from "../../database/db";
import {
  blockedUsersTable,
  commentsTable,
  communitiesTable,
  communityMembersTable,
  voteTable,
} from "../../database";
import { and, eq, sql, count, desc, or, isNotNull, isNull } from "drizzle-orm";
import post from "../../helpers/db/selects/post";
import { setCommentDetails } from "../../helpers/details/comment";
import { freshBoostByDate } from "../../algorithm/database/freshBoostByDate";
import { memberBoost } from "../../algorithm/feed/memberBoost";
import QueryValidationMiddleware from "../../helpers/middlewares/QueryValidation";
import { selfPenalty } from "../../algorithm/feed/selfPenalty";
import searchRouter from "./search";
const router = express.Router();

router.use(searchRouter);

router.get(
  "/best",
  (req, res, next) =>
    QueryValidationMiddleware(
      req,
      res,
      next,
      z.object({
        offset: z
          .string()
          .transform((val) => parseInt(val))
          .optional(),
      })
    ),
  async (req, res) => {
    const boost = memberBoost(req.user?.id || "");
    let { offset } = req.query;
    if (!offset) offset = "0";
    const fc = sql`(${commentsTable.score}) + ${boost} + (${freshBoostByDate(
      commentsTable.createdAt,
      24
    )}) + (${selfPenalty(req.user?.id || "")})`.as("fc");
    const posts = await db
      .select({ ...post, comments: count(commentsTable.relatedTo), fc })
      .from(commentsTable)
      .leftJoin(
        communityMembersTable,
        and(
          eq(communityMembersTable.communityId, commentsTable.communityId),
          eq(communityMembersTable.userId, req.user?.id || "")
        )
      )
      .leftJoin(
        communitiesTable,
        eq(communitiesTable.id, commentsTable.communityId)
      )
      .leftJoin(
        voteTable,
        and(
          eq(voteTable.commentId, commentsTable.id),
          eq(voteTable.userId, req.user?.id || "")
        )
      )
      .leftJoin(
        blockedUsersTable,
        and(
          eq(blockedUsersTable.blockedBy, req.user?.id || ""),
          eq(blockedUsersTable.blockedUser, commentsTable.createdBy)
        )
      )
      .where(
        and(
          eq(commentsTable.post, true),
          eq(commentsTable.deleted, false),

          or(
            eq(communitiesTable.visibility, "public"),
            and(
              eq(communitiesTable.visibility, "private"),
              isNotNull(communityMembersTable.userId)
            )
          ),

          isNull(blockedUsersTable.blockedUser)
        )
      )
      .groupBy(commentsTable.id)
      .orderBy(desc(fc))
      .limit(10)
      .offset(parseInt(offset as string));
    for (const comment of posts) {
      await setCommentDetails(comment);
      const [community] = await db
        .select()
        .from(communitiesTable)
        .where(eq(communitiesTable.id, comment.communityId!));
      (comment as any).community = community;
    }

    const [{ count: totalComments }] = await db
      .select({ count: count() })
      .from(commentsTable)
      .leftJoin(
        communityMembersTable,
        and(
          eq(communityMembersTable.communityId, commentsTable.communityId),
          eq(communityMembersTable.userId, req.user?.id || "")
        )
      )
      .leftJoin(
        communitiesTable,
        eq(communitiesTable.id, commentsTable.communityId)
      )
      .where(
        and(
          eq(commentsTable.post, true),
          eq(commentsTable.deleted, false),
          or(
            eq(communitiesTable.visibility, "public"),
            and(
              eq(communitiesTable.visibility, "private"),
              isNotNull(communityMembersTable.userId)
            )
          )
        )
      );

    return res.status(200).json({
      posts: posts.map((post) => ({ ...post, fc: undefined })),
      pagination: {
        totalComments,
        currentPage: Math.floor(Number(offset) / 10) + 1,
        totalPages: Math.ceil(totalComments / 10),
        itemsPerPage: 10,
        hasNextPage: Number(offset) + 10 < totalComments,
        hasPreviousPage: Number(offset) > 0,
      },
    });
  }
);

router.get(
  "/new",
  (req, res, next) =>
    QueryValidationMiddleware(
      req,
      res,
      next,
      z.object({
        offset: z
          .string()
          .transform((val) => parseInt(val))
          .optional(),
      })
    ),
  async (req, res) => {
    let { offset } = req.query;
    if (!offset) offset = "0";
    const posts = await db
      .select({ ...post, comments: count(commentsTable.relatedTo) })
      .from(commentsTable)
      .leftJoin(
        communityMembersTable,
        and(
          eq(communityMembersTable.communityId, commentsTable.communityId),
          eq(communityMembersTable.userId, req.user?.id || "")
        )
      )
      .leftJoin(
        communitiesTable,
        eq(communitiesTable.id, commentsTable.communityId)
      )
      .leftJoin(
        voteTable,
        and(
          eq(voteTable.commentId, commentsTable.id),
          eq(voteTable.userId, req.user?.id || "")
        )
      )
      .leftJoin(
        blockedUsersTable,
        and(
          eq(blockedUsersTable.blockedBy, req.user?.id || ""),
          eq(blockedUsersTable.blockedUser, commentsTable.createdBy)
        )
      )
      .where(
        and(
          eq(commentsTable.post, true),
          eq(commentsTable.deleted, false),

          or(
            eq(communitiesTable.visibility, "public"),
            and(
              eq(communitiesTable.visibility, "private"),
              isNotNull(communityMembersTable.userId)
            )
          ),

          isNull(blockedUsersTable.blockedUser)
        )
      )
      .groupBy(commentsTable.id)
      .orderBy(desc(commentsTable.createdAt))
      .limit(10)
      .offset(parseInt(offset as string));

    for (const comment of posts) {
      await setCommentDetails(comment);
      const [community] = await db
        .select()
        .from(communitiesTable)
        .where(eq(communitiesTable.id, comment.communityId!));
      (comment as any).community = community;
    }

    const [{ count: totalComments }] = await db
      .select({ count: count() })
      .from(commentsTable)
      .leftJoin(
        communityMembersTable,
        and(
          eq(communityMembersTable.communityId, commentsTable.communityId),
          eq(communityMembersTable.userId, req.user?.id || "")
        )
      )
      .leftJoin(
        communitiesTable,
        eq(communitiesTable.id, commentsTable.communityId)
      )
      .where(
        and(
          eq(commentsTable.post, true),
          eq(commentsTable.deleted, false),
          or(
            eq(communitiesTable.visibility, "public"),
            and(
              eq(communitiesTable.visibility, "private"),
              isNotNull(communityMembersTable.userId)
            )
          )
        )
      );

    return res.status(200).json({
      posts: posts.map((post) => ({ ...post })),
      pagination: {
        totalComments,
        currentPage: Math.floor(Number(offset) / 10) + 1,
        totalPages: Math.ceil(totalComments / 10),
        itemsPerPage: 10,
        hasNextPage: Number(offset) + 10 < totalComments,
        hasPreviousPage: Number(offset) > 0,
      },
    });
  }
);

export default router;
