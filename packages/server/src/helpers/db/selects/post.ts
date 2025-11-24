import { isNotNull } from "drizzle-orm";
import { commentsTable, voteTable, bookmarksTable } from "../../../database";

export default {
  id: commentsTable.id,
  title: commentsTable.title,
  content: commentsTable.content,
  tags: commentsTable.tags,
  attachments: commentsTable.attachments,
  createdBy: commentsTable.createdBy,
  communityId: commentsTable.communityId,
  replyTo: commentsTable.replyTo,
  relatedTo: commentsTable.relatedTo,
  deleted: commentsTable.deleted,
  vote: voteTable.type,
  saved: isNotNull(bookmarksTable.id),
  createdAt: commentsTable.createdAt,
  updatedAt: commentsTable.updatedAt,
};
