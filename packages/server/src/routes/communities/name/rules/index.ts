import express from "express";
import { requireAuth } from "../../../../helpers/middlewares/Auth";
import RequirePermission from "../../../../helpers/middlewares/RequirePermission";
import { db } from "../../../../database/db";
import { communitiesTable, communityRulesTable } from "../../../../database";
import { desc, eq } from "drizzle-orm";
import BodyValidationMiddleware from "../../../../helpers/middlewares/BodyValidation";
import { createRuleSchema } from "../../../../helpers/validations/communities/rule/create";
import CanAccessCommunity from "../../../../helpers/middlewares/CanAccessCommunity";
const router = express.Router();

router.get(
  "/:name/rules",
  (req, res, next) => CanAccessCommunity(req, res, next),
  async (req, res) => {
    const { name } = req.params;
    const [community] = await db
      .select()
      .from(communitiesTable)
      .where(eq(communitiesTable.name, name));
    const rules = await db
      .select()
      .from(communityRulesTable)
      .where(eq(communityRulesTable.communityId, community.id))
      .orderBy(desc(communityRulesTable.priority));

    return res.status(200).json(rules);
  }
);

router.post(
  "/:name/rules",
  requireAuth,
  (req, res, next) => RequirePermission(req, res, next, "MANAGE_COMMUNITY"),
  (req, res, next) =>
    BodyValidationMiddleware(req, res, next, createRuleSchema),
  async (req, res) => {
    const { name } = req.params;
    const { content } = req.body;
    const [community] = await db
      .select()
      .from(communitiesTable)
      .where(eq(communitiesTable.name, name));

    const rules = await db
      .select()
      .from(communityRulesTable)
      .where(eq(communityRulesTable.communityId, community.id));

    if (rules.length >= 10)
      return res.status(400).json({
        success: false,
        message: "A community can have at most 10 rules",
      });
    const topRule = rules.sort((a, b) => b.priority - a.priority)?.[0];
    const [{ id }] = await db
      .insert(communityRulesTable)
      .values({
        communityId: community.id,
        content,
        priority: (topRule?.priority ?? -1) + 1,
      })
      .$returningId();

    return res.status(200).json({ success: true, data: { id, content } });
  }
);

export default router;
