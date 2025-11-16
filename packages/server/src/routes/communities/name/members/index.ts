import express from "express";
import BodyValidationMiddleware from "../../../../helpers/middlewares/BodyValidation";
import z from "zod";
import { db } from "../../../../database/db";
import user from "../../../../helpers/db/selects/user";
import { communityMembersTable, usersTable } from "../../../../database";
import { eq, inArray } from "drizzle-orm";
const router = express.Router();

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

    const users = await db
      .select({ ...user, joinedAt: communityMembersTable.joinedAt })
      .from(usersTable)
      .leftJoin(
        communityMembersTable,
        eq(communityMembersTable.userId, usersTable.id)
      )
      .where(inArray(usersTable.id, userIds))
      .groupBy(usersTable.id);

    return res.status(200).json({ users });
  }
);

export default router;
