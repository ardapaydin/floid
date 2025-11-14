import z from "zod";

export const createPostSchema = z.object({
  title: z.string().max(300).trim(),
  content: z.string().max(10240).trim(),
  tags: z.array(z.string()).max(10).optional().default([]),
  attachments: z.array(z.string()).max(10).optional().default([]),
});
