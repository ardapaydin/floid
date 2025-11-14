import { commentsTable, voteTable } from "../../../database";

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
  createdAt: commentsTable.createdAt,
  updatedAt: commentsTable.updatedAt,
};
