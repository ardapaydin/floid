import type { Ban } from "@/types/ban";
import type { Flair } from "@/types/flair";
import type { User } from "@/types/user";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useMembersSearch(name: string, query: string | null) {
  return useQuery({
    queryKey: ["communities", name, "members", query, "search"],
    queryFn: async () => {
      const r = await axios.get(
        "/community/" + name + "/members?query=" + query
      );
      return r.data as User[];
    },
    enabled: Boolean(query),
  });
}

export function useBannedMembers(name: string) {
  return useQuery({
    queryKey: ["communities", name, "members", "ban"],
    queryFn: async () => {
      const r = await axios.get("/community/" + name + "/bans");
      return r.data as Ban[];
    },
  });
}

export function banMember(
  name: string,
  memberId: string,
  reason: string,
  expiresAt: Date | null
) {
  return axios.post("/community/" + name + "/members/" + memberId + "/ban", {
    reason,
    expiresAt,
  });
}

export function unbanMember(name: string, memebrId: string) {
  return axios.delete("/community/" + name + "/members/" + memebrId + "/ban");
}

export function setFlair(name: string, flairId: string) {
  return axios.post("/community/" + name + "/members/me/flair/" + flairId);
}

export function useMembersMe(name: string) {
  return useQuery({
    queryKey: ["communities", name, "members", "me"],
    queryFn: async () => {
      const r = await axios.get("/community/" + name + "/members/me");
      return r.data as User & { flair: Flair | null; role: string };
    },
  });
}
