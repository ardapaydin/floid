import type { Community } from "@/types/community";
import type { User } from "@/types/user";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useInviteLink(id: string) {
  return useQuery({
    queryKey: ["invites", id],
    queryFn: async () => {
      const r = await axios.get("/invites/" + id);
      return r.data as {
        community: Community;
        creator: User;
        navigate: string;
        message: string;
      };
    },
  });
}

export function joinWithInviteLink(id: string) {
  return axios.post("/invites/" + id);
}
