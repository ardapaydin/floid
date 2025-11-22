import express from "express";
import { db } from "../../database/db";
import { communitiesTable, communityMembersTable } from "../../database";
import { count, desc, eq, sql } from "drizzle-orm";
const router = express.Router();

router.get("/communities", async (req, res) => {
  const members = count(communityMembersTable.userId);
  const communities = await db
    .select({
      id: communitiesTable.id,
      name: communitiesTable.name,
      icon: communitiesTable.icon,
      members,
    })
    .from(communitiesTable)
    .leftJoin(
      communityMembersTable,
      eq(communityMembersTable.communityId, communitiesTable.id)
    )
    .where(eq(communitiesTable.visibility, "public"))
    .groupBy(communitiesTable.id)
    .orderBy(desc(members))
    .limit(10);

  return res.status(200).json(communities);
});

export default router;
