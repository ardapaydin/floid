import z from "zod";

export const awardPostSchema = z.object({
  awardId: z.int(),
});
