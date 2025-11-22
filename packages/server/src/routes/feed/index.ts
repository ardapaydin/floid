import express from "express";
import z from "zod";
import { db } from "../../database/db";
import {
  commentsTable,
  communitiesTable,
  communityMembersTable,
  voteTable,
} from "../../database";
import { and, eq, inArray, sql, count, desc, or, isNotNull } from "drizzle-orm";
import { caseWhen } from "../../database/custom/dcase";
import post from "../../helpers/db/selects/post";
import ParamValidationMiddleware from "../../helpers/middlewares/ParamValidation";
import { setCommentDetails } from "../../helpers/details/comment";
import { mul } from "../../algorithm/database/mul";
import { freshBoostByDate } from "../../algorithm/database/freshBoostByDate";
import { memberBoost } from "../../algorithm/feed/memberBoost";
const router = express.Router();

router.get(
  "/:page",
  (req, res, next) =>
    ParamValidationMiddleware(
      req,
      res,
      next,
      z.object({ page: z.enum(["best"]) })
    ),
  async (req, res) => {
    const boost = memberBoost(req.user?.id || "");

    const fc = sql`(${commentsTable.score}) + ${boost} + (${freshBoostByDate(
      commentsTable.createdAt,
      24
    )})`;

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
      )
      .groupBy(commentsTable.id)
      .orderBy(desc(fc))
      .limit(10);
    for (const comment of posts) await setCommentDetails(comment);
    return res
      .status(200)
      .json(posts.map((post) => ({ ...post, fc: undefined })));
  }
);

export default router;
