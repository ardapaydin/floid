import express from "express";
import { requireAuth } from "../../../../helpers/middlewares/Auth";
import CanAccessCommunity from "../../../../helpers/middlewares/CanAccessCommunity";
import { db } from "../../../../database/db";
import { communitiesTable, flairTable } from "../../../../database";
import { and, eq } from "drizzle-orm";
import RequirePermission from "../../../../helpers/middlewares/RequirePermission";
import BodyValidationMiddleware from "../../../../helpers/middlewares/BodyValidation";
import { createFlairSchema } from "../../../../helpers/validations/communities/flairs/create";
const router = express.Router();

router.get(
  "/:name/flairs",
  requireAuth,
  CanAccessCommunity,
  async (req, res) => {
    const { name } = req.params;
    const [community] = await db
      .select()
      .from(communitiesTable)
      .where(eq(communitiesTable.name, name));
    const flairs = await db
      .select()
      .from(flairTable)
      .where(eq(flairTable.communityId, community.id));

    return res.status(200).json(flairs);
  }
);

router.post(
  "/:name/flairs",
  requireAuth,
  (req, res, next) => RequirePermission(req, res, next, "MANAGE_COMMUNITY"),
  (req, res, next) =>
    BodyValidationMiddleware(req, res, next, createFlairSchema),
  async (req, res) => {
    const { name } = req.params;
    const { flair, color } = req.body;
    const [community] = await db
      .select()
      .from(communitiesTable)
      .where(eq(communitiesTable.name, name));

    const [{ id }] = await db
      .insert(flairTable)
      .values({
        flair,
        color,
        communityId: community.id,
        createdBy: req.user!.id,
      })
      .$returningId();

    const [flaird] = await db
      .select()
      .from(flairTable)
      .where(eq(flairTable.id, id));

    return res.status(200).json({ success: true, flair: flaird });
  }
);

router.put(
  "/:name/flairs/:flairId",
  requireAuth,
  (req, res, next) => RequirePermission(req, res, next, "MANAGE_COMMUNITY"),
  (req, res, next) =>
    BodyValidationMiddleware(req, res, next, createFlairSchema),
  async (req, res) => {
    const { name, flairId } = req.params;
    const { flair: content, modOnly, color } = req.body;
    const [community] = await db
      .select()
      .from(communitiesTable)
      .where(eq(communitiesTable.name, name));

    const [flair] = await db
      .select()
      .from(flairTable)
      .where(
        and(
          eq(flairTable.id, flairId),
          eq(flairTable.communityId, community.id)
        )
      );
    if (!flair)
      return res
        .status(404)
        .json({ success: false, message: "Flair not found." });

    await db
      .update(flairTable)
      .set({
        flair: content,
        modOnly,
        color,
      })
      .where(eq(flairTable.id, flair.id));

    const [flairD] = await db
      .select()
      .from(flairTable)
      .where(eq(flairTable.id, flairId));
    return res.status(200).json({ success: true, data: flairD });
  }
);

router.delete(
  "/:name/flairs/:flairId",
  requireAuth,
  (req, res, next) => RequirePermission(req, res, next, "MANAGE_COMMUNITY"),
  async (req, res) => {
    const { name, flairId } = req.params;

    const [community] = await db
      .select()
      .from(communitiesTable)
      .where(eq(communitiesTable.name, name));

    const [flair] = await db
      .select()
      .from(flairTable)
      .where(
        and(
          eq(flairTable.id, flairId),
          eq(flairTable.communityId, community.id)
        )
      );

    if (!flair)
      return res
        .status(404)
        .json({ success: false, message: "flair not found" });

    await db.delete(flairTable).where(eq(flairTable.id, flair.id));

    return res.status(200).json({ success: true });
  }
);

export default router;
