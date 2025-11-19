import z from "zod";

export const createCommentSchema = z.object({
  content: z.string().max(10240).trim(),
});
