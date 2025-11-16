import type { Post } from "@/types/post";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function createCommunityPost(name: string, body: object) {
  return axios.post("/community/" + name + "/posts", body);
}

export function usePosts(name: string, sort: "best" | "new") {
  return useQuery({
    queryKey: [name, "posts", "sort", sort],
    queryFn: async () => {
      const d = await axios.get("/community/" + name + "/posts?sort=" + sort);
      return d.data as Post[];
    },
  });
}

export function usePost(name: string, postId: string) {
  return useQuery({
    queryKey: [name, "posts", postId],
    queryFn: async () => {
      const d = await axios.get("/community/" + name + "/posts/" + postId);
      return d.data as { post: Post };
    },
  });
}
