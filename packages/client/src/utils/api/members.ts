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
