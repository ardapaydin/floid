import { and, eq, inArray } from "drizzle-orm";
import { communitiesTable, communityMembersTable } from "../../database";
import { db } from "../../database/db";
import permissions from "./permissions";

export default async function getPermissions(
  userId: string | undefined,
  communityId: string
) {
  if (!userId) return "0";
  const [community] = await db
    .select()
    .from(communitiesTable)
    .where(eq(communitiesTable.id, communityId));
  if (community.creator == userId)
    return (
      BigInt(2) ** BigInt([...permissions.values()].length) -
      BigInt(1)
    ).toString();

  const [member] = await db
    .select()
    .from(communityMembersTable)
    .where(
      and(
        eq(communityMembersTable.communityId, communityId),
        eq(communityMembersTable.userId, userId)
      )
    );
  let perms = BigInt(0);

  if (!member) return perms.toString();
  if (member.role == "mod")
    return (
      BigInt(2) ** BigInt([...permissions.values()].length) -
      BigInt(1)
    ).toString();

  return perms.toString();
}
