import type { Community } from "@/types/community";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useExploreCommunities() {
  return useQuery({
    queryKey: ["explore", "community"],
    queryFn: async () => {
      const r = await axios.get("/explore/communities");
      return r.data as (Community & { members: number })[];
    },
  });
}
