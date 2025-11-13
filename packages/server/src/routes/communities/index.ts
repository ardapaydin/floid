import express from "express";
import BodyValidationMiddleware from "../../helpers/middlewares/BodyValidation";
import { communityCreateSchema } from "../../helpers/validations/communities/create";
import { db } from "../../database/db";
import {
  communitiesTable,
  communityMembersTable,
} from "../../database/schemas/communities";
import { eq, inArray, sql } from "drizzle-orm";
import { requireAuth } from "../../helpers/middlewares/Auth";
import z from "zod";
import NameRouter from "./name";
const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const memberships = await db
    .select()
    .from(communityMembersTable)
    .where(eq(communityMembersTable.userId, req.user!.id as string));

  const communityIds = memberships.map((membership) => membership.communityId);

  const communities = await db
    .select()
    .from(communitiesTable)
    .where(inArray(communitiesTable.id, communityIds));

  return res.status(200).json(communities);
});
router.post(
  "/",
  requireAuth,
  (req, res, next) =>
    BodyValidationMiddleware(req, res, next, communityCreateSchema),
  async (req, res) => {
    const { name, description } = req.body;

    const [find] = await db
      .select()
      .from(communitiesTable)
      .where(eq(sql`LOWER(${communitiesTable.name})`, name.toLowerCase()));

    if (find)
      return res.status(400).json({
        succcess: false,
        message: "Name is taken",
        errors: {
          name: ["Community with this name already exists"],
        },
      });

    const [{ id }] = await db
      .insert(communitiesTable)
      .values({ name, description, creator: req.user!.id })
      .$returningId();

    await db.insert(communityMembersTable).values({
      userId: req.user?.id as string,
      communityId: id,
    });

    return res
      .status(200)
      .json({ success: true, data: { id, name, description } });
  }
);

router.post(
  "/dryrun/name",
  requireAuth,
  (req, res, next) =>
    BodyValidationMiddleware(req, res, next, z.object({ name: z.string() })),
  async (req, res) => {
    const { name } = req.body;
    const [find] = await db
      .select()
      .from(communitiesTable)
      .where(eq(sql`LOWER(${communitiesTable.name})`, name.toLowerCase()));

    return res.status(200).json({ taken: !!find });
  }
);

router.use(NameRouter);

export default router;
