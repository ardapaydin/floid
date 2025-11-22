import type { Community } from "@/types/community";

export function getRecentCommunities(): Community[] {
  const data = localStorage.getItem("recentCommunities");
  return data ? JSON.parse(data) : [];
}

export function addRecentCommunity(community: Community) {
  let recent = getRecentCommunities();
  recent = recent.filter((c) => c.id != community.id);
  recent.unshift(community);

  if (recent.length > 5) recent = recent.slice(0, 5);

  localStorage.setItem("recentCommunities", JSON.stringify(recent));
}
