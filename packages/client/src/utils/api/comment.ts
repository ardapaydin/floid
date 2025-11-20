import axios from "axios";

export function replyComment(name: string, commentId: string, content: string) {
  return axios.post(
    "/community/" + name + "/comments/" + commentId + "/comment",
    { content }
  );
}

export function deleteComment(name: string, commentId: string) {
  return axios.delete("/community/" + name + "/comments/" + commentId);
}
