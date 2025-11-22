import type { User } from "@/types/user";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useRoleMembers(name: string, role: "mod") {
  return useQuery({
    queryKey: ["communities", name, "roles", role, "members"],
    queryFn: async () => {
      const r = await axios.get(
        "/community/" + name + "/roles/" + role + "/members"
      );
      return r.data as User[];
    },
  });
}

export function setMemberRole(name: string, memberId: string, role: string) {
  return axios.post(
    "/community/" + name + "/members/" + memberId + "/roles/" + role
  );
}
