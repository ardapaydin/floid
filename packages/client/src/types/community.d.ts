export interface Community {
  id: string;
  name: string;
  description?: string;
  icon: string;
  banner: string;
  creator: string;
  visibility: "public" | "private";
  disabled: boolean;
  createdAt: string;
  updatedAt: string;
  permissions: string;
}
