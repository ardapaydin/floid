import { and, eq, gt } from "drizzle-orm";
import { resetPasswordTable, usersTable } from "../../database";
import { db } from "../../database/db";
import { randomBytes } from "crypto";
import { sendEmail } from "..";
export async function createResetPasswordToken(email: string) {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  const [find] = await db
    .select()
    .from(resetPasswordTable)
    .where(
      and(
        eq(resetPasswordTable.userId, user.id),
        eq(resetPasswordTable.email, email),
        gt(resetPasswordTable.createdAt, new Date(Date.now() - 30 * 60 * 1000))
      )
    );

  if (find)
    await sendEmail("ResetPassword", email, {
      subject: "Reset Password",
      url: `${process.env.APP_URL}/reset-password?token=${find.token}`,
    });
  else {
    const token =
      Buffer.from(
        JSON.stringify({
          email,
          userId: user.id,
          timestamp: Date.now(),
        })
      ).toString("base64") +
      "." +
      randomBytes(16).toString("hex");

    await db.insert(resetPasswordTable).values({
      token,
      userId: user.id,
      email,
    });

    await sendEmail("ResetPassword", email, {
      subject: "Reset Password",
      url: `${process.env.APP_URL}/reset-password?token=${token}`,
    });
  }

  return true;
}
