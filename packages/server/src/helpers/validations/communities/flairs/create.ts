import z from "zod";

export const createFlairSchema = z.object({
  flair: z.string().trim().min(1).max(32),
  color: z.string().regex(/^#([0-9A-Fa-f]{6})$/),
  modOnly: z.boolean().default(false),
});
