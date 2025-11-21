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

export function updateCommunityRule(
  name: string,
  ruleId: string,
  title: string,
  content: string
) {
  return axios.put("/community/" + name + "/rules/" + ruleId, {
    title,
    content,
  });
}

export function deleteCommunityRule(name: string, ruleId: string) {
  return axios.delete("/community/" + name + "/rules/" + ruleId);
}
