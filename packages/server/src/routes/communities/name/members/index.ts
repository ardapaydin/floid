import express from "express";
import BodyValidationMiddleware from "../../../../helpers/middlewares/BodyValidation";
import z from "zod";
import { db } from "../../../../database/db";
import user from "../../../../helpers/db/selects/user";
import {
  communitiesTable,
  communityMembersTable,
  usersTable,
} from "../../../../database";
import { and, eq, inArray, like, or } from "drizzle-orm";
import { requireAuth } from "../../../../helpers/middlewares/Auth";
import roleRouter from "./role";
import RequirePermission from "../../../../helpers/middlewares/RequirePermission";
import QueryValidationMiddleware from "../../../../helpers/middlewares/QueryValidation";
const router = express.Router();
router.use(roleRouter);
router.post(
  "/:name/members/details",
  (req, res, next) =>
    BodyValidationMiddleware(
      req,
      res,
      next,
      z.object({ userIds: z.array(z.string()).max(50) })
    ),
  async (req, res) => {
    const { userIds } = req.body;
    const { name } = req.params;
    const [community] = await db
      .select()
      .from(communitiesTable)
      .where(eq(communitiesTable.name, name));
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
      .where(inArray(usersTable.id, userIds))
      .groupBy(usersTable.id);

    return res.status(200).json({ users });
  }
);

router.get(
  "/:name/members",
  requireAuth,
  (req, res, next) => RequirePermission(req, res, next, "MANAGE_MEMBERS"),
  (req, res, next) =>
    QueryValidationMiddleware(
      req,
      res,
      next,
      z.object({
        query: z.string(),
      })
    ),
  async (req, res) => {
    const { name } = req.params;
    const { query } = req.query;
    const [community] = await db
      .select()
      .from(communitiesTable)
      .where(eq(communitiesTable.name, name));

    const members = await db
      .select()
      .from(communityMembersTable)
      .where(eq(communityMembersTable.communityId, community.id));

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
        and(
          inArray(
            usersTable.id,
            members.map((member) => member.userId)
          ),
          or(
            like(usersTable.username, `%${query}%`),
            like(usersTable.displayName, `%${query}%`),
            like(usersTable.id, `%${query}%`)
          )
        )
      )
      .groupBy(usersTable.id)
      .limit(10);

    return res.status(200).json(users);
  }
);

router.post("/:name/join", requireAuth, async (req, res) => {
  const { name } = req.params;
  const [community] = await db
    .select()
    .from(communitiesTable)
    .where(eq(communitiesTable.name, name));

  const [member] = await db
    .select()
    .from(communityMembersTable)
    .where(
      and(
        eq(communityMembersTable.userId, req.user!.id),
        eq(communityMembersTable.communityId, community.id)
      )
    );

  if (member)
    return res
      .status(409)
      .json({ success: false, message: "already member of community" });

  await db.insert(communityMembersTable).values({
    userId: req.user!.id,
    communityId: community.id,
  });

  return res.status(200).json({ success: true });
});

router.post("/:name/leave", requireAuth, async (req, res) => {
  const { name } = req.params;
  const [communiy] = await db
    .select()
    .from(communitiesTable)
    .where(eq(communitiesTable.name, name));

  const [find] = await db
    .select()
    .from(communityMembersTable)
    .where(
      and(
        eq(communityMembersTable.userId, req.user!.id),
        eq(communityMembersTable.communityId, communiy.id)
      )
    );

  if (!find)
    return res
      .status(400)
      .json({ success: false, message: "not member of this community" });

  if (req.user!.id == communiy.creator)
    return res.status(400).json({
      success: false,
      message: "cannot leave from your own community",
    });

  await db
    .delete(communityMembersTable)
    .where(eq(communityMembersTable.id, find.id));

  return res.status(200).json({ success: true });
});

export default router;
