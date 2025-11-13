import axios from "axios";

export function register(username: string, email: string, password: string) {
  return axios.post("/auth/register", { username, email, password });
}

export function login(email: string, password: string) {
  return axios.post("/auth/login", { email, password });
}
