import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function register(username: string, email: string, password: string) {
  return axios.post("/auth/register", { username, email, password });
}

export function login(email: string, password: string) {
  return axios.post("/auth/login", { email, password });
}

export function useVerifyEmail(token: string | null) {
  return useQuery({
    queryKey: ["verify-email", token],
    queryFn: async () => {
      const r = await axios.post("/auth/verify-email", { token });
      return r.data;
    },
    enabled: Boolean(token),
  });
}

export function requestVerifyToken() {
  return axios.post("/auth/request-token");
}

export function logout() {
  return axios.post("/auth/logout");
}
