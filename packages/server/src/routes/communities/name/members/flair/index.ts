import express from "express";
import { requireAuth } from "../../../../../helpers/middlewares/Auth";
import CanAccessCommunity from "../../../../../helpers/middlewares/CanAccessCommunity";
import { db } from "../../../../../database/db";
import {
  communitiesTable,
  communityMembersTable,
  flairTable,
} from "../../../../../database";
import { and, eq } from "drizzle-orm";
const router = express.Router();

router.post(
  "/:name/members/me/flair/:flairId",
  requireAuth,
  CanAccessCommunity,
  async (req, res) => {
    const { name, flairId } = req.params;
    const [community] = await db
      .select()
      .from(communitiesTable)
      .where(eq(communitiesTable.name, name));
    const [member] = await db
      .select()
      .from(communityMembersTable)
      .where(
        and(
          eq(communityMembersTable.communityId, community.id),
          eq(communityMembersTable.userId, req.user!.id)
        )
      );

    if (!member)
      return res
        .status(400)
        .json({ success: false, message: "not a member of this community." });

    const [flair] = await db
      .select()
      .from(flairTable)
      .where(
        and(
          eq(flairTable.communityId, community.id),
          eq(flairTable.id, flairId)
        )
      );
    if (!flair)
      return res
        .status(400)
        .json({ success: false, message: "flair not found." });

    await db
      .update(communityMembersTable)
      .set({ flair: flairId })
      .where(
        and(
          eq(communityMembersTable.userId, member.userId),
          eq(communityMembersTable.communityId, community.id)
        )
      );

    return res.status(200).json({ success: true, flair });
  }
);

export default router;
