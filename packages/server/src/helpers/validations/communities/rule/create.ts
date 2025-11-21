import z from "zod";

export const createRuleSchema = z.object({
  content: z.string().min(1).max(255),
});
