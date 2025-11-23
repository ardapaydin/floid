import express from "express";
import { requireAuth } from "../../../../../helpers/middlewares/Auth";
import BodyValidationMiddleware from "../../../../../helpers/middlewares/BodyValidation";
import { banMemberSchema } from "../../../../../helpers/validations/communities/members/ban";
import { db } from "../../../../../database/db";
import {
  banTable,
  communitiesTable,
  usersTable,
} from "../../../../../database";
import { and, eq } from "drizzle-orm";
const router = express.Router();

router.post(
  "/:name/members/:memberId/ban",
  requireAuth,
  (req, res, next) => BodyValidationMiddleware(req, res, next, banMemberSchema),
  async (req, res) => {
    const { reason, expiresAt } = req.body;
    const { name, memberId } = req.params;

    const [community] = await db
      .select()
      .from(communitiesTable)
      .where(eq(communitiesTable.name, name));

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, memberId));
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "User not found." });
    const [banned] = await db
      .select()
      .from(banTable)
      .where(
        and(
          eq(banTable.communityId, community.id),
          eq(banTable.userId, memberId)
        )
      );

    if (banned)
      await db
        .update(banTable)
        .set({
          reason,
          expiresAt,
          bannedBy: req.user!.id,
        })
        .where(eq(banTable.id, banned.id));
    else
      await db.insert(banTable).values({
        reason,
        expiresAt,
        bannedBy: req.user!.id,
        communityId: community.id,
        userId: memberId,
      });

    return res.status(200).json({ success: true });
  }
);

export default router;
