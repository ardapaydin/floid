import type { User } from "./user";

export type Ban = {
  id: string;
  userId: string;
  bannedBy: string;
  reason: string;
  expiresAt: string | null;
  banned: User;
  createdAt: string;
  updatedAt: string;
};
