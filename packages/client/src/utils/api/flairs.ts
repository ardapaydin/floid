import type { Flair } from "@/types/flair";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useFlairs(name: string) {
  return useQuery({
    queryKey: ["communities", name, "flairs"],
    queryFn: async () => {
      const r = await axios.get("/community/" + name + "/flairs");
      return r.data as Flair[];
    },
  });
}

export function createFlair(
  name: string,
  flair: string,
  color: string,
  modOnly: boolean
) {
  return axios.post("/community/" + name + "/flairs", {
    flair,
    color,
    modOnly,
  });
}

export function updateFlair(
  name: string,
  flairId: string,
  flair: string,
  color: string,
  modOnly: boolean
) {
  return axios.put("/community/" + name + "/flairs/" + flairId, {
    flair,
    color,
    modOnly,
  });
}

export function deleteFlair(name: string, flairId: string) {
  return axios.delete("/community/" + name + "/flairs/" + flairId);
}
