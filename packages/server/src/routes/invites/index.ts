import express from "express";
import { requireAuth } from "../../helpers/middlewares/Auth";
import { db } from "../../database/db";
import {
  communitiesTable,
  communityMembersTable,
  invitesTable,
} from "../../database";
import { and, eq } from "drizzle-orm";
const router = express.Router();

router.get("/:invite", requireAuth, async (req, res) => {
  const { invite } = req.params;

  const [find] = await db
    .select()
    .from(invitesTable)
    .where(eq(invitesTable.id, invite));
  if (!find || find.maxUses >= find.uses)
    return res
      .status(404)
      .json({ success: false, message: "Invite not found or expired." });

  const [community] = await db
    .select()
    .from(communitiesTable)
    .where(eq(communitiesTable.id, find.communityId));

  const [member] = await db
    .select()
    .from(communityMembersTable)
    .where(
      and(
        eq(communityMembersTable.communityId, community.id),
        eq(communityMembersTable.userId, req.user!.id)
      )
    );
  if (member)
    return res
      .status(400)
      .json({ success: false, message: "Already member of this community." });

  return res.status(200).json({ community, invite: find });
});

export default router;
