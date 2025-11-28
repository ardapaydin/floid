import { and, eq } from "drizzle-orm";
import { twoFactorAuthenticatonTable } from "../../database";
import { db } from "../../database/db";
import { JwtPayload, sign, verify } from "jsonwebtoken";
import { Request } from "express";

export async function RequireMFA(
  req: Request,
  options: ("backup" | "totp")[] = ["totp", "backup"],
  userId?: string
) {
  if (userId) req.user = { id: userId };
  const [find] = await db
    .select()
    .from(twoFactorAuthenticatonTable)
    .where(
      and(
        eq(twoFactorAuthenticatonTable.userId, req.user!.id),
        eq(twoFactorAuthenticatonTable.verified, true)
      )
    );
  const mfa = (req.headers as any)["x-mfa-authorization"];
  if (find) {
    const ticket = sign(
      { userId: req.user!.id, type: "ticket", options },
      process.env.MFA_JWT_SECRET as string
    );

    if (!mfa)
      return {
        success: false,
        message: "2fa",
        mfa: {
          ticket,
          options,
        },
      };

    let verifyt;
    try {
      verifyt = (await verify(
        mfa,
        process.env.MFA_JWT_SECRET as string
      )) as JwtPayload;
    } catch {
      return {
        success: false,
        message: "2fa",
        mfa: { ticket, options },
      };
    }

    if (!verifyt.userId || verifyt.userId != req.user!.id)
      return { success: false, message: "invalid mfa token" };

    if (!options.includes(verifyt.type))
      return { success: false, message: "This option is not supported" };

    return { success: true };
  }
}
