import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { User } from "../../types/user";
import type { Post } from "@/types/post";
import type { Community } from "@/types/community";

export function useUser() {
  return useQuery({
    queryKey: ["users", "me"],
    queryFn: async () => {
      const req = await axios.get("/users/me");
      return req.data as {
        user?: User;
        blocked?: string[];
        twoFactor?: boolean;
      };
    },
  });
}

export function useUserProfile(name: string) {
  return useQuery({
    queryKey: ["users", name, "profile"],
    queryFn: async () => {
      const r = await axios.get("/users/" + name + "/profile");
      return r.data as User & {
        rep: number;
        posts: (Post & { community: Community })[];
        comments: (Post & { community: Community; relatedTitle: string })[];
        followers: number;
        following: boolean;
      };
    },
  });
}

export function updateUserProfilePicture(data: FormData) {
  return axios.post("/users/me/picture", data);
}

export function updateUserBanner(data: FormData) {
  return axios.post("/users/me/banner", data);
}

export function followUser(name: string) {
  return axios.post("/users/" + name + "/follow");
}

export function unfollowUser(name: string) {
  return axios.delete("/users/" + name + "/follow");
}

export function updateUser(data: Record<string, string>) {
  return axios.post("/users/me", data);
}

export function deleteUser(password: string) {
  return axios.delete("/users/me", { data: { password } });
}

export function blockUser(name: string) {
  return axios.post("/users/" + name + "/block");
}

export function unblockUser(name: string) {
  return axios.delete("/users/" + name + "/block");
}

export function useBlockedUsers(enabled: boolean) {
  return useQuery({
    queryKey: ["users", "me", "blocked"],
    queryFn: async () => {
      const r = await axios.get("/users/me/blocked");
      return r.data as User[];
    },
    enabled,
  });
}

export function useBookmarks(query: string) {
  return useInfiniteQuery({
    queryKey: ["users", "me", "bookmarks", query],
    queryFn: async ({ pageParam }) => {
      const d = await axios.get(
        "/users/me/saved?query=" + query + "&offset=" + pageParam
      );
      return d.data as {
        posts: Post[];
        pagination: {
          hasNextPage: boolean;
          currentPage: number;
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
