import { eq, inArray } from "drizzle-orm";
import { caseWhen } from "../../database/custom/dcase";
import { commentsTable, communityMembersTable } from "../../database";
import { MEMBER_OF_COMMUNITY_WEIGHT } from "../weights";
import { db } from "../../database/db";
import { when } from "../../database/custom/when";

export async function memberBoost(userId: string) {
  const member = await db
    .select()
    .from(communityMembersTable)
    .where(eq(communityMembersTable.userId, userId));

  const mwhen = when(
    inArray(
      commentsTable.communityId,
      member.map((x) => x.communityId)
    ),
    MEMBER_OF_COMMUNITY_WEIGHT
  );

  return caseWhen([mwhen], 0);
}
