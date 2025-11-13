import z from "zod";

export const communityCreateSchema = z.object({
  name: z
    .string()
    .regex(/^[a-zA-Z0-9]*$/, "Name cannot contain special characters or spaces")
    .max(32)
    .min(3),
  description: z.string().max(2048).trim().nullable(),
});
