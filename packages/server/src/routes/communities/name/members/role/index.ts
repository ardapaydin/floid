import express from "express";
import { requireAuth } from "../../../../../helpers/middlewares/Auth";
import RequirePermission from "../../../../../helpers/middlewares/RequirePermission";
import ParamValidationMiddleware from "../../../../../helpers/middlewares/ParamValidation";
import z from "zod";
import { db } from "../../../../../database/db";
import {
  communitiesTable,
  communityMembersTable,
} from "../../../../../database";
import { and, eq } from "drizzle-orm";
const router = express.Router();

router.post(
  "/:name/members/:memberId/roles/:role",
  requireAuth,
  (req, res, next) => RequirePermission(req, res, next, "MANAGE_MEMBERS"),
  (req, res, next) =>
    ParamValidationMiddleware(
      req,
      res,
      next,
      z.object({
        name: z.string(),
        memberId: z.string(),
        role: z.enum(["mod", "member"]),
      })
    ),
  async (req, res) => {
    const { name, memberId, role } = req.params;
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
        .json({ success: false, message: "member not found" });
    if (memberId == req.user?.id)
      return res
        .status(400)
        .json({ success: false, message: "cannot edit yourself" });
    if (memberId == community.creator)
      return res
        .status(400)
        .json({ success: false, message: "cannot edit community creator" });
    await db
      .update(communityMembersTable)
      .set({
        role: role as "member" | "mod",
      })
      .where(
        and(
          eq(communityMembersTable.communityId, community.id),
          eq(communityMembersTable.userId, req.user!.id)
        )
      );
  }
);

export default router;
