import express from "express";
import { requireAuth } from "../../../../helpers/middlewares/Auth";
import RequirePermission from "../../../../helpers/middlewares/RequirePermission";
import { db } from "../../../../database/db";
import { communitiesTable, invitesTable } from "../../../../database";
import { eq } from "drizzle-orm";
import BodyValidationMiddleware from "../../../../helpers/middlewares/BodyValidation";
import z from "zod";
const router = express.Router();

router.post(
  "/:name/invites",
  requireAuth,
  (req, res, next) => RequirePermission(req, res, next, "MANAGE_COMMUNITY"),
  (req, res, next) =>
    BodyValidationMiddleware(
      req,
      res,
      next,
      z.object({ maxUses: z.int().max(100).min(1).default(50).optional() })
    ),
  async (req, res) => {
    const { name } = req.params;

    const [community] = await db
      .select()
      .from(communitiesTable)
      .where(eq(communitiesTable.name, name));

    if (community.visibility != "private")
      return res
        .status(400)
        .json({ success: false, message: "Community is public" });

    const [{ id }] = await db
      .insert(invitesTable)
      .values({
        communityId: community.id,
        createdBy: req.user!.id,
      })
      .$returningId();

    return res.status(200).json({ success: true, id });
  }
);

export default router;
