import express from "express";
import BodyValidationMiddleware from "../../../helpers/middlewares/BodyValidation";
import z from "zod";
import { db } from "../../../database/db";
import { emailVerificationTable, usersTable } from "../../../database";
import { and, eq } from "drizzle-orm";
import { requireAuth } from "../../../helpers/middlewares/Auth";
import { createToken } from "../../../email/verification/generateToken";
const router = express.Router();

router.post(
  "/verify-email",
  (req, res, next) =>
    BodyValidationMiddleware(
      req,
      res,
      next,
      z.object({
        token: z.string(),
      })
    ),
  async (req, res) => {
    const { token } = req.body;

    const [find] = await db
      .select()
      .from(emailVerificationTable)
      .where(
        and(
          eq(emailVerificationTable.token, token),
          eq(emailVerificationTable.used, false)
        )
      );

    if (!find)
      return res.status(400).json({ success: false, message: "Bad token" });

    const [user] = await db
      .select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.id, find.userId),
          eq(usersTable.email, find.email),
          eq(usersTable.emailVerified, false)
        )
      );
    if (!user)
      return res.status(400).json({ success: false, message: "Bad token" });

    await db
      .update(usersTable)
      .set({ emailVerified: true })
      .where(eq(usersTable.id, user.id));
    await db
      .update(emailVerificationTable)
      .set({ used: true })
      .where(eq(emailVerificationTable.id, find.id));

    return res.status(200).json({ success: true });
  }
);

router.post("/request-token", requireAuth, async (req, res) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.user!.id));
  await createToken(user.email);

  return res.status(200).json({ success: true });
});

export default router;
