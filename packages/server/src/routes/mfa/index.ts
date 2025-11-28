import express from "express";
import { JwtPayload, sign, verify } from "jsonwebtoken";
import { db } from "../../database/db";
import { backupCodesTable, twoFactorAuthenticatonTable } from "../../database";
import { and, eq } from "drizzle-orm";
import { totp } from "speakeasy";
const router = express.Router();

router.post("/finish", async (req, res) => {
  const { type, code, ticket } = req.body;
  const verifyTicket = verify(
    ticket,
    process.env.MFA_JWT_SECRET as string
  ) as JwtPayload;
  if (
    !verifyTicket.userId ||
    verifyTicket.type != "ticket" ||
    !verifyTicket.options.includes(type)
  )
    return res.status(400).json({ success: false, message: "bad ticket" });
  const [userTFA] = await db
    .select()
    .from(twoFactorAuthenticatonTable)
    .where(
      and(
        eq(twoFactorAuthenticatonTable.userId, verifyTicket.userId),
        eq(twoFactorAuthenticatonTable.verified, true)
      )
    );

  if (!userTFA)
    return res.status(400).json({ success: false, message: "bad request" });
  if (type == "totp") {
    const verifyTotp = await totp.verify({
      secret: userTFA.secret,
      encoding: "base32",
      token: code,
      window: 1,
    });

    if (!verifyTotp)
      return res.status(400).json({
        success: false,
        message: "bad request",
        errors: { code: ["Invalid code."] },
      });
  } else if (type == "backup") {
    const [findBackupCode] = await db
      .select()
      .from(backupCodesTable)
      .where(
        and(
          eq(backupCodesTable.twoFaId, userTFA.id),
          eq(backupCodesTable.key, code),
          eq(backupCodesTable.userId, verifyTicket.userId),
          eq(backupCodesTable.used, false)
        )
      );

    if (!findBackupCode)
      return res.status(400).json({
        success: false,
        message: "bad request",
        errors: { code: ["Backup code is invalid or already used."] },
      });

    await db
      .update(backupCodesTable)
      .set({ used: true })
      .where(eq(backupCodesTable.id, findBackupCode.id));
  } else return res.status(400).json({ success: false, message: "bad type." });

  const signedToken = sign(
    { type, userId: verifyTicket.userId },
    process.env.MFA_JWT_SECRET as string,
    { expiresIn: "10m" }
  );

  return res.status(200).json({
    success: true,
    data: {
      token: signedToken,
      header: "x-mfa-authorization",
    },
  });
});

export default router;
