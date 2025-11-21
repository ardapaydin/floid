import axios from "axios";

export function createCommunityRule(
  name: string,
  title: string,
  content: string
) {
  return axios.post("/community/" + name + "/rules", { title, content });
}

export function updateCommunityRulePriorities(name: string, rules: string[]) {
  return axios.post("/community/" + name + "/rules-priority", { rules });
}
