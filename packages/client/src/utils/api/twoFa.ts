import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useTwoFactor(enabled: boolean) {
  return useQuery({
    queryKey: ["users", "me", "2fa", "setup"],
    queryFn: async () => {
      const r = await axios.post("/users/me/2fa/setup");
      return r.data as {
        success: boolean;
        data: {
          qrUrl: string;
          secret: string;
        };
      };
    },
    enabled,
  });
}

export function verifyTwoFactor(code: string) {
  return axios.post("/users/me/2fa/verify", { code });
}

export function disableTwoFactor() {
  return axios.delete("/users/me/2fa");
}

export function finishMFA(type: string, code: string, ticket: string) {
  return axios.post("/mfa/finish", { type, code, ticket });
}
