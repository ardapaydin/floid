import express from "express";
import RequirePermission from "../../../../helpers/middlewares/RequirePermission";
import { requireAuth } from "../../../../helpers/middlewares/Auth";
import ParamValidationMiddleware from "../../../../helpers/middlewares/ParamValidation";
import z from "zod";
import {
  communitiesTable,
  communityMembersTable,
  usersTable,
} from "../../../../database";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "../../../../database/db";
import user from "../../../../helpers/db/selects/user";
const router = express.Router();

router.get(
  "/:name/roles/:role/members",
  requireAuth,
  (req, res, next) => RequirePermission(req, res, next, "MANAGE_MEMBERS"),
  (req, res, next) =>
    ParamValidationMiddleware(
      req,
      res,
      next,
      z.object({
        name: z.string(),
        role: z.enum(["mod"]),
      })
    ),
  async (req, res) => {
    const { name, role } = req.params;

    const [community] = await db
      .select()
      .from(communitiesTable)
      .where(eq(communitiesTable.name, name));

    const members = await db
      .select()
      .from(communityMembersTable)
      .where(
        and(
          eq(communityMembersTable.communityId, community.id),
          eq(communityMembersTable.role, role as "mod")
        )
      );

    const users = await db
      .select({ ...user, joinedAt: communityMembersTable.joinedAt })
      .from(usersTable)
      .leftJoin(
        communityMembersTable,
        and(
          eq(communityMembersTable.userId, usersTable.id),
          eq(communityMembersTable.communityId, community.id)
        )
      )
      .where(
        inArray(
          usersTable.id,
          members.map((member) => member.userId)
        )
      )
      .groupBy(usersTable.id);

    return res.status(200).json(users);
  }
);

export default router;
