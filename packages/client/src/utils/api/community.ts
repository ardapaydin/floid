import type { Community } from "@/types/community";
import type { Rule } from "@/types/rule";
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

export function useCommunityByName(name: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["communities", name],
    queryFn: async () => {
      const d = await axios.get("/community/" + name);
      return d.data as Community;
    },
    enabled,
  });
}

export function useCommunityRules(name: string) {
  return useQuery({
    queryKey: ["communities", name, "rules"],
    queryFn: async () => {
      const d = await axios.get("/community/" + name + "/rules");
      return d.data as Rule[];
    },
  });
}

export function getMembersDetails(name: string, userIds: string[]) {
  return axios.post("/community/" + name + "/members/details", {
    userIds,
  });
}

export function uploadIcon(name: string, form: FormData) {
  return axios.put("/community/" + name + "/icon", form);
}

export function uploadBanner(name: string, form: FormData) {
  return axios.put("/community/" + name + "/banner", form);
}

export function joinCommunity(name: string) {
  return axios.post("/community/" + name + "/join");
}

export function leaveCommunity(name: string) {
  return axios.post("/community/" + name + "/leave");
}
