import express from "express";
import { requireAuth } from "../../../../../helpers/middlewares/Auth";
import BodyValidationMiddleware from "../../../../../helpers/middlewares/BodyValidation";
import { banMemberSchema } from "../../../../../helpers/validations/communities/members/ban";
import { db } from "../../../../../database/db";
import {
  banTable,
  communitiesTable,
  communityMembersTable,
  usersTable,
} from "../../../../../database";
import { and, eq, inArray } from "drizzle-orm";
import RequirePermission from "../../../../../helpers/middlewares/RequirePermission";
import user from "../../../../../helpers/db/selects/user";
const router = express.Router();

router.get(
  "/:name/bans",
  requireAuth,
  (req, res, next) => RequirePermission(req, res, next, "MANAGE_MEMBERS"),
  async (req, res) => {
    const { name } = req.params;
    const [community] = await db
      .select()
      .from(communitiesTable)
      .where(eq(communitiesTable.name, name));
    let bans = await db
      .select()
      .from(banTable)
      .where(eq(banTable.communityId, community.id));

    const users = await db
      .select(user)
      .from(usersTable)
      .where(
        inArray(
          usersTable.id,
          bans.map((x) => x.userId)
        )
      );

    for (const ban of bans)
      (ban as any).banned = users.find((x) => x.id == ban.userId);

    return res.status(200).json(bans);
  }
);

router.post(
  "/:name/members/:memberId/ban",
  requireAuth,
  (req, res, next) => BodyValidationMiddleware(req, res, next, banMemberSchema),
  (req, res, next) => RequirePermission(req, res, next, "MANAGE_MEMBERS"),
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

    if (memberId == req.user!.id)
      return res
        .status(400)
        .json({ success: false, message: "Cannot ban yourself" });

    if (community.creator == memberId)
      return res
        .status(403)
        .json({ success: false, message: "Cannot ban community creator." });

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

    await db
      .delete(communityMembersTable)
      .where(
        and(
          eq(communityMembersTable.userId, memberId),
          eq(communityMembersTable.communityId, community.id)
        )
      );

    return res.status(200).json({ success: true });
  }
);

export default router;
