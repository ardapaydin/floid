import express from "express";
import { requireAuth } from "../../helpers/middlewares/Auth";
import { db } from "../../database/db";
import {
  banTable,
  communitiesTable,
  communityMembersTable,
  invitesTable,
  usersTable,
} from "../../database";
import { and, eq } from "drizzle-orm";
import user from "../../helpers/db/selects/user";
const router = express.Router();

router.get("/:invite", requireAuth, async (req, res) => {
  const { invite } = req.params;

  const [find] = await db
    .select()
    .from(invitesTable)
    .where(eq(invitesTable.id, invite));
  if (!find || find.uses >= find.maxUses)
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
    return res.status(400).json({
      success: false,
      message: "Already member of this community.",
      navigate: "/c/" + community.name,
    });

  if (community.visibility == "public")
    return res.status(400).json({
      success: false,
      message: "This community is public",
      navigate: "/c/" + community.name,
    });

  const [creator] = await db
    .select(user)
    .from(usersTable)
    .where(eq(usersTable.id, find.createdBy));

  return res.status(200).json({ community, creator });
});

router.post("/:invite", requireAuth, async (req, res) => {
  const { invite } = req.params;

  const [find] = await db
    .select()
    .from(invitesTable)
    .where(eq(invitesTable.id, invite));

  if (!find || find.uses >= find.maxUses)
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

  const [banned] = await db
    .select()
    .from(banTable)
    .where(
      and(
        eq(banTable.userId, req.user!.id),
        eq(banTable.communityId, community.id)
      )
    );
  if (banned && (!banned.expiresAt || new Date() < new Date(banned.expiresAt)))
    return res.status(403).json({
      success: false,
      message: "User is banned from this community.",
    });

  if (community.visibility == "public")
    return res
      .status(400)
      .json({ success: false, message: "This community is public" });

  await db.insert(communityMembersTable).values({
    communityId: community.id,
    userId: req.user!.id,
  });

  await db
    .update(invitesTable)
    .set({
      uses: find.uses + 1,
    })
    .where(eq(invitesTable.id, find.id));

  return res.status(200).json({ success: true });
});

export default router;
