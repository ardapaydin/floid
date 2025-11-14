import express from "express";
import { db } from "../../../database/db";
import { communitiesTable, communityMembersTable } from "../../../database";
import { and, eq, sql } from "drizzle-orm";
import getPermissions from "../../../helpers/permissions/getPermissions";
import { requireAuth } from "../../../helpers/middlewares/Auth";
import RequirePermission from "../../../helpers/middlewares/RequirePermission";
import BodyValidationMiddleware from "../../../helpers/middlewares/BodyValidation";
import { communityUpdateSchema } from "../../../helpers/validations/communities/update";
const router = express.Router();

router.get("/:name", async (req, res) => {
  const [find] = await db
    .select()
    .from(communitiesTable)
    .where(eq(communitiesTable.name, req.params.name));

  if (!find)
    return res
      .status(404)
      .json({ success: false, message: "Community not found." });
  if (find.visibility == "private") {
    if (!req.user?.id)
      return res
        .status(404)
        .json({ success: false, message: "Community not found." });
    const [member] = await db
      .select()
      .from(communityMembersTable)
      .where(
        and(
          eq(communityMembersTable.userId, req.user.id),
          eq(communityMembersTable.communityId, find.id)
        )
      );

    if (!member)
      return res
        .status(404)
        .json({ success: false, message: "Community not found." });
  }

  return res.status(200).json({
    ...find,
    ...{ permissions: await getPermissions(req.user?.id, find.id) },
  });
});

router.put(
  "/:name",
  requireAuth,
  (req, res, next) => RequirePermission(req, res, next, "MANAGE_COMMUNITY"),
  (req, res, next) =>
    BodyValidationMiddleware(req, res, next, communityUpdateSchema),
  async (req, res) => {
    const { name: communityName } = req.params;
    const { name, description, visibility } = req.body;
    if (name) {
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
    }
    await db
      .update(communitiesTable)
      .set({
        name,
        description,
        visibility,
      })
      .where(eq(communitiesTable.name, communityName));

    return res.status(200).json({ success: true });
  }
);

export default router;
