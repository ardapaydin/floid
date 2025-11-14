import axios from "axios";

export function createCommunityPost(name: string, body: object) {
  return axios.post("/community/" + name + "/posts", body);
}
