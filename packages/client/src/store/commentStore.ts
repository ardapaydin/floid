import type { Post } from "@/types/post";
import { makeAutoObservable } from "mobx";

class CommentStore {
  comments = new Map<string, Post>();
  constructor() {
    makeAutoObservable(this);
  }

  getComment(commentId: string) {
    return this.comments.get(commentId);
  }

  setComment(comment: Post) {
    if (this.getComment(comment.id)) return;
    this.comments.set(comment.id, comment);
  }

  setComments(comments: Post[]) {
    for (const comment of comments) this.setComment(comment);
  }

  voteComment(commentId: string, vote: "up" | "down" | null) {
    const comment = this.getComment(commentId);
    if (!comment) throw new Error("Comment not found on store (voteComment)");
    const oldVote = comment.vote;
    let newVotes = comment.votes;

    if (vote === null) {
      if (oldVote === "up") newVotes -= 1;
      else if (oldVote === "down") newVotes += 1;
    } else if (vote === "up") {
      if (oldVote === "down") newVotes += 2;
      else if (oldVote === null) newVotes += 1;
    } else if (vote === "down") {
      if (oldVote === "up") newVotes -= 2;
      else if (oldVote === null) newVotes -= 1;
    }

    this.setCommentData(commentId, { votes: newVotes, vote });
  }

  setCommentData(commentId: string, data: Partial<Post>) {
    const comment = this.getComment(commentId);
    if (!comment)
      throw new Error("Comment not found on store (setCommentData)");

    this.comments.set(commentId, { ...comment, ...data });
  }
}

export const commentStore = new CommentStore();
