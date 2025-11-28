import express from "express";
import { requireAuth } from "../../../../../../helpers/middlewares/Auth";
import CanAccessCommunity from "../../../../../../helpers/middlewares/CanAccessCommunity";
import { db } from "../../../../../../database/db";
import {
  commentsTable,
  communitiesTable,
  usedReputationsTable,
} from "../../../../../../database";
import { awardTable } from "../../../../../../database/schemas/award";

import { and, eq } from "drizzle-orm";
import BodyValidationMiddleware from "../../../../../../helpers/middlewares/BodyValidation";
import { awardPostSchema } from "../../../../../../helpers/validations/communities/post/award/create";
import { setCommentDetails } from "../../../../../../helpers/details/comment";
import awards from "../../../../../../data/awards";
const router = express.Router();

router.post(
  "/:name/posts/:postId/awards",
  requireAuth,
  CanAccessCommunity,
  (req, res, next) => BodyValidationMiddleware(req, res, next, awardPostSchema),
  async (req, res) => {
    const { name, postId } = req.params;
    const { awardId } = req.body;
    const [community] = await db
      .select()
      .from(communitiesTable)
      .where(eq(communitiesTable.name, name));

    const [post] = await db
      .select()
      .from(commentsTable)
      .where(
        and(
          eq(commentsTable.id, postId),
          eq(commentsTable.communityId, community.id),
          eq(commentsTable.post, true)
        )
      );

    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });

    if (post.deleted)
      return res
        .status(400)
        .json({ success: false, message: "Cannot award deleted posts" });

    if (post.createdBy == req.user!.id)
      return res
        .status(400)
        .json({ success: false, message: "You cannot award your own posts" });

    const userPosts = await db
      .select()
      .from(commentsTable)
      .where(eq(commentsTable.createdBy, req.user!.id));
    let balance = 0;
    for (const post of userPosts) {
      await setCommentDetails(post);
      balance += (post as any).votes;
    }

    const [used] = await db
      .select()
      .from(usedReputationsTable)
      .where(eq(usedReputationsTable.userId, req.user!.id));

    balance -= used?.used || 0;

    const award = awards.find((award) => award.id == awardId);
    if (!award)
      return res
        .status(400)
        .json({ success: false, message: "award not found." });

    if (balance < award.reputation)
      return res
        .status(400)
        .json({ success: false, message: "you cannot afford this award." });

    await db.insert(awardTable).values({
      commentId: post.id,
      awardedBy: req.user!.id,
      awardedTo: post.createdBy,
      gived: award.id,
    } as any);

    if (used)
      await db
        .update(usedReputationsTable)
        .set({
          used: balance + award.reputation,
        })
        .where(eq(usedReputationsTable.userId, req.user!.id));
    else
      await db.insert(usedReputationsTable).values({
        userId: req.user!.id,
        used: award.reputation,
      });

    return res.status(200).json({ success: true });
  }
);

export default router;
