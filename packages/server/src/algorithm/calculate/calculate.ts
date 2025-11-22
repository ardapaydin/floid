import { getFollowersBoost } from "./getFollowers";
import { reputationBoost } from "./reputation";

export async function calculate(userId: string) {
  const follower = await getFollowersBoost(userId);
  const rep = await reputationBoost(userId);

  const c = follower + rep;
  return c;
}
