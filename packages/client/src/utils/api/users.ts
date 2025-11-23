import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { User } from "../../types/user";
import type { Post } from "@/types/post";
import type { Community } from "@/types/community";

export function useUser() {
  return useQuery({
    queryKey: ["users", "me"],
    queryFn: async () => {
      const req = await axios.get("/users/me");
      return req.data as { user?: User };
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
