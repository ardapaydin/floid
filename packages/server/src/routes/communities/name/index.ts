import express from "express";
import { db } from "../../../database/db";
import { communitiesTable, communityMembersTable } from "../../../database";
import { and, eq } from "drizzle-orm";
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

  return res.status(200).json(find);
});

export default router;
