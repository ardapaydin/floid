import z from "zod";

export const banMemberSchema = z.object({
  reason: z.string().max(255).min(1).trim(),
  expiresAt: z
    .string()
    .transform((val) => (val ? new Date(val) : null))
    .refine((date) => !date || date instanceof Date, "Invalid date")
    .refine((date) => !date || date >= new Date(), "Date must be in the future")
    .refine((date) => !date || date <= new Date(2099, 11, 31), "Invalid date")
    .nullable(),
});
