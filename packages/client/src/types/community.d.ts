export interface Community {
    id: string;
    name: string;
    description?: string;
    creator: string;
    visibility: "public" | "private";
    disabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}