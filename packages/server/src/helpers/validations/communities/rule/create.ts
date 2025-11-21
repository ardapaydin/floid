import z from "zod";

export const createRuleSchema = z.object({
  title: z.string().min(1).max(64).trim(),
  content: z.string().min(1).max(255).trim(),
});
