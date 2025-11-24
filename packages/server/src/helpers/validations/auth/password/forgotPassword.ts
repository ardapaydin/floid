import z from "zod";
import { db } from "../../../../database/db";
import { usersTable } from "../../../../database";
import { eq } from "drizzle-orm";

export const forgotPasswordSchema = z.object({
  email: z.email().refine(async (arg) => {
    const [find] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, arg));
    return !!find;
  }, "User not found"),
});
