import type { Community } from "@/types/community";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function createCommunity(name: string, description: string) {
  return axios.post("/community", { name, description });
}

export function updateCommunity(name: string, data: object) {
  return axios.put("/community/" + name, data);
}

export function useDryrunName(name: string) {
  return useQuery({
    queryKey: ["dryrun", "name", name],
    queryFn: async () => {
      const d = await axios.post("/community/dryrun/name", { name });
      return d.data;
    },
    enabled: !!name,
  });
}

export function useCommunities() {
  return useQuery({
    queryKey: ["communities"],
    queryFn: async () => {
      const d = await axios.get("/community");
      return d.data as Community[];
    },
  });
}

export function useCommunityByName(name: string) {
  return useQuery({
    queryKey: ["communities", name],
    queryFn: async () => {
      const d = await axios.get("/community/" + name);
      return d.data as Community;
    },
  });
}
