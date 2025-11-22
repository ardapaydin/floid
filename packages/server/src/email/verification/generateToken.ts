import { eq } from "drizzle-orm";
import { emailVerificationTable, usersTable } from "../../database";
import { db } from "../../database/db";
import crypto from "crypto";
import { sendEmail } from "..";
export async function createToken(email: string) {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));
  await db
    .delete(emailVerificationTable)
    .where(eq(emailVerificationTable.userId, user.id));

  const token =
    Buffer.from(
      JSON.stringify({
        email,
        timestamp: Date.now(),
      })
    ).toString("base64") +
    "." +
    crypto.randomBytes(16).toString("hex");

  await db.insert(emailVerificationTable).values({
    token,
    userId: user.id,
    email,
  });

  await sendEmail("VerifyEmail", email, {
    subject: "Verify your email",
    url: `${process.env.APP_URL}/verify-email?token=${token}`,
  });

  return true;
}
