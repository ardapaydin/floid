import express from "express";
import { requireAuth } from "../../../helpers/middlewares/Auth";
import { db } from "../../../database/db";
import { twoFactorAuthenticatonTable, usersTable } from "../../../database";
import { and, eq } from "drizzle-orm";
import speakeasy from "speakeasy";
import qrcode, { toDataURL } from "qrcode";
import BodyValidationMiddleware from "../../../helpers/middlewares/BodyValidation";
import z from "zod";
const router = express.Router();

router.post("/me/2fa/setup", requireAuth, async (req, res) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.user!.id));

  if (!user.emailVerified)
    return res
      .status(400)
      .json({ success: false, message: "email is not verified" });

  const [findTFA] = await db
    .select()
    .from(twoFactorAuthenticatonTable)
    .where(eq(twoFactorAuthenticatonTable.userId, req.user!.id));

  let secret;
  if (!findTFA) {
    let { base32 } = speakeasy.generateSecret({
      name: `Floid (u/${user.username})`,
      issuer: "Floid",
    });
    await db.insert(twoFactorAuthenticatonTable).values({
      userId: req.user!.id,
      secret: base32,
    });
    secret = base32;
  } else secret = findTFA.secret;

  const qrUrl = await toDataURL(
    `otpauth://totp/Floid:u/${user.username}?secret=${secret}&issuer=Floid`,
    {
      errorCorrectionLevel: "M",
      width: 512,
      margin: 1,
    }
  );

  return res.status(200).json({ success: true, data: { secret, qrUrl } });
});

router.post(
  "/me/2fa/enable",
  requireAuth,
  (req, res, next) =>
    BodyValidationMiddleware(
      req,
      res,
      next,
      z.object({
        code: z.string().length(6),
      })
    ),
  async (req, res) => {
    const { code: token } = req.body;
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.user!.id));

    if (!user.emailVerified)
      return res
        .status(400)
        .json({ success: false, message: "email is not verified" });

    const [twoFa] = await db
      .select()
      .from(twoFactorAuthenticatonTable)
      .where(
        and(
          eq(twoFactorAuthenticatonTable.userId, user.id),
          eq(twoFactorAuthenticatonTable.verified, false)
        )
      );

    if (!twoFa)
      return res.status(400).json({
        success: false,
        message: "two factor authentication data not found",
      });

    const verifyCode = speakeasy.totp.verify({
      secret: twoFa.secret,
      encoding: "base32",
      token,
      window: 1,
    });

    if (!verifyCode)
      return res.status(400).json({
        success: false,
        message: "invalid code",
        errors: { code: ["Invalid code."] },
      });

    await db
      .update(twoFactorAuthenticatonTable)
      .set({
        verified: true,
      })
      .where(eq(twoFactorAuthenticatonTable.id, twoFa.id));

    return res.status(200).json({ success: true });
  }
);

export default router;
