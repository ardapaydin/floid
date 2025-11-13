import axios from "axios";

export function createCommunity(name: string, description: string) {
  return axios.post("/community", { name, description });
}
