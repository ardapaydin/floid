import express from "express";
import { requireAuth } from "../../../../helpers/middlewares/Auth";
import RequirePermission from "../../../../helpers/middlewares/RequirePermission";
import { db } from "../../../../database/db";
import { communitiesTable, communityRulesTable } from "../../../../database";
import { and, desc, eq, inArray } from "drizzle-orm";
import BodyValidationMiddleware from "../../../../helpers/middlewares/BodyValidation";
import { createRuleSchema } from "../../../../helpers/validations/communities/rule/create";
import CanAccessCommunity from "../../../../helpers/middlewares/CanAccessCommunity";
import { updateRulePrioritiesSchema } from "../../../../helpers/validations/communities/rule/priority";
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
    const { content, title } = req.body;
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
        title,
        communityId: community.id,
        content,
        priority: (topRule?.priority ?? -1) + 1,
      })
      .$returningId();

    return res.status(200).json({ success: true, data: { id, content } });
  }
);

router.post(
  "/:name/rules-priority",
  requireAuth,
  (req, res, next) => RequirePermission(req, res, next, "MANAGE_COMMUNITY"),
  (req, res, next) =>
    BodyValidationMiddleware(req, res, next, updateRulePrioritiesSchema),
  async (req, res) => {
    const { name } = req.params;
    let { rules } = req.body;
    rules = [...new Set(rules)];
    const [community] = await db
      .select()
      .from(communitiesTable)
      .where(eq(communitiesTable.name, name));

    const findRules = await db
      .select()
      .from(communityRulesTable)
      .where(
        and(
          inArray(communityRulesTable.id, rules),
          eq(communityRulesTable.communityId, community.id)
        )
      );

    if (findRules.length != rules.length)
      return res.status(400).json({
        success: false,
        message: "One or more rules do not exist in this community",
      });

    let i = 0;
    const newRules: { id: string; priority: number }[] = [];
    for (const rule of findRules) {
      await db
        .update(communityRulesTable)
        .set({
          priority: i,
        })
        .where(eq(communityRulesTable.id, rule.id));
      newRules.push({ id: rule.id, priority: i });
      i++;
    }

    return res.status(200).json({ success: true, data: newRules });
  }
);

export default router;
