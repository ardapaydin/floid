import z from "zod";

export const banMemberSchema = z.object({
  reason: z.string().max(255).min(1).trim(),
  expiresAt: z
    .date()
    .min(new Date())
    .max(new Date(2099, 11, 31))
    .optional(),
});
