import type { Post } from "@/types/post";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import axios from "axios";

export function createCommunityPost(name: string, body: object) {
  return axios.post("/community/" + name + "/posts", body);
}

export function usePosts(name: string, sort: "best" | "new") {
  return useInfiniteQuery({
    queryKey: [name, "posts", "sort", sort],
    queryFn: async ({ pageParam }) => {
      const d = await axios.get(
        "/community/" +
          name +
          "/posts?sort=" +
          sort +
          "&offset=" +
          pageParam +
          "&limit=10"
      );
      return d.data as {
        posts: Post[];
        pagination: {
          totalItems: number;
          currentPage: number;
          totalPages: number;
          itemsPerPage: number;
          hasNextPage: boolean;
          hasPreviousPage: boolean;
        };
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.currentPage * 10
        : undefined,
  });
}

export function usePost(name: string, postId: string) {
  return useQuery({
    queryKey: [name, "posts", postId],
    queryFn: async () => {
      const d = await axios.get("/community/" + name + "/posts/" + postId);
      return d.data as { post: Post; replies: Post[] };
    },
  });
}

export function votePost(
  name: string,
  postId: string,
  vote: "up" | "down" | null
) {
  return axios.post("/community/" + name + "/comments/" + postId + "/vote", {
    vote,
  });
}

export function uploadAttachment(name: string, formdata: FormData) {
  return axios.post("/community/" + name + "/attachments", formdata);
}
