import z from "zod";

export const updateRulePrioritiesSchema = z.object({
  rules: z.array(z.string()),
});
