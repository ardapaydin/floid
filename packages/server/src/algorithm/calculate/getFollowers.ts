import { count, eq } from "drizzle-orm";
import { followersTable } from "../../database";
import { db } from "../../database/db";
import { FOLLOWER_WEIGHT } from "../weights";

export async function getFollowersBoost(userId: string) {
  const [followers] = await db
    .select({ count: count() })
    .from(followersTable)
    .where(eq(followersTable.following, userId));

  return followers.count * FOLLOWER_WEIGHT;
}
