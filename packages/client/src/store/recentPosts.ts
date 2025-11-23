import type { Community } from "@/types/community";
import type { Post } from "@/types/post";

export function getRecentPosts(): (Post & { community: Community })[] {
  const data = localStorage.getItem("recentPosts");
  return data ? JSON.parse(data) : [];
}

export function addRecentPost(post: Post & { community: Community }) {
  let r = getRecentPosts();

  r = r.filter((p) => p.id != post.id);
  r.unshift(post);

  if (r.length > 8) r = r.slice(0, 8);
  localStorage.setItem("recentPosts", JSON.stringify(r));
}

export function clearRecentPosts() {
  localStorage.setItem("recentPosts", JSON.stringify([]));
}
