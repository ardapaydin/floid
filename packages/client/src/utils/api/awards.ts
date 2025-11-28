import type { Award } from "@/types/award";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useAwards(enabled: boolean) {
  return useQuery({
    queryKey: ["awards"],
    queryFn: async () => {
      const r = await axios.get("/awards");
      return r.data as Award[];
    },
    enabled,
  });
}

export function useBalance(enabled: boolean) {
  return useQuery({
    queryKey: ["awards", "balance"],
    queryFn: async () => {
      const r = await axios.get("/awards/balance");
      return r.data as { success: boolean; balance: number };
    },
    enabled,
  });
}
