import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { User } from "../../types/user";

export function useUser() {
  return useQuery({
    queryKey: ["users", "me"],
    queryFn: async () => {
      const req = await axios.get("/users/me");
      return req.data as { user?: User };
    },
  });
}

export function getUsersDetails(userIds: string[]) {
  return axios.post("/users/details", { userIds });
}
