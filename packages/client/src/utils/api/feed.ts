import type { Post } from "@/types/post";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";

export function useFeedPosts(feed: "best" | "new") {
  return useInfiniteQuery({
    queryKey: ["feed", feed],
    queryFn: async ({ pageParam }) => {
      const d = await axios.get("/feed/" + feed + "?offset=" + pageParam);
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
      lastPage.pagination?.hasNextPage
        ? lastPage.pagination?.currentPage * 10
        : undefined,
  });
}

export function useFeedSearch(query: string | null) {
  return useInfiniteQuery({
    queryKey: ["feed", "search", query],
    queryFn: async ({ pageParam }) => {
      const d = await axios.get(
        "/feed/search?query=" + query + "&offset=" + pageParam
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
      lastPage.pagination?.hasNextPage
        ? lastPage.pagination?.currentPage * 10
        : undefined,
    enabled: Boolean(query),
  });
}
