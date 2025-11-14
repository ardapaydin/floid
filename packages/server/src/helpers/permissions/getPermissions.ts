import { and, eq, inArray } from "drizzle-orm";
import { communitiesTable, communityMembersTable } from "../../database";
import { db } from "../../database/db";
import permissions from "./permissions";
import { rolesTable } from "../../database/schemas/roles";

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
      BigInt(2) ** BigInt([...permissions.values()].length - 1)
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
  const roles = await db
    .select()
    .from(rolesTable)
    .where(
      and(
        eq(rolesTable.communityId, communityId),
        inArray(rolesTable.id, JSON.parse(member.roles as unknown as string))
      )
    );

  for (let role of roles) perms |= BigInt(role.permissions);

  return perms.toString();
}
