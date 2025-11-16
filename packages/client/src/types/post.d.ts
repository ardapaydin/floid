export interface Post {
  id: string;
  title: string;
  content: string;
  tags: string;
  attachments: string;
  createdBy: string;
  communityId: string;
  replyTo: string | null;
  relatedTo: string | null;
  deleted: boolean;
  vote: ("up" | "down") | null;
  votes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
}
