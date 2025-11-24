import express from "express";
import BodyValidationMiddleware from "../../../helpers/middlewares/BodyValidation";
import { forgotPasswordSchema } from "../../../helpers/validations/auth/password/forgotPassword";
import { createResetPasswordToken } from "../../../email/resetPassword/generateToken";
import QueryValidationMiddleware from "../../../helpers/middlewares/QueryValidation";
import z from "zod";
import { db } from "../../../database/db";
import { resetPasswordTable, usersTable } from "../../../database";
import { and, eq, gt } from "drizzle-orm";
import { resetPasswordSchema } from "../../../helpers/validations/auth/password/reset";
import { EncryptPassword } from "../../../helpers/encryptions/password";
const router = express.Router();

router.post(
  "/forgot-password",
  (req, res, next) =>
    BodyValidationMiddleware(req, res, next, forgotPasswordSchema),
  async (req, res) => {
    const { email } = req.body;
    res.status(200).json({ success: true });

    await createResetPasswordToken(email);
  }
);

router.get(
  "/reset-password",
  (req, res, next) =>
    QueryValidationMiddleware(req, res, next, z.object({ token: z.string() })),
  async (req, res) => {
    const { token } = req.query;

    const [find] = await db
      .select()
      .from(resetPasswordTable)
      .where(
        and(
          eq(resetPasswordTable.token, token as string),
          eq(resetPasswordTable.used, false),
          gt(
            resetPasswordTable.createdAt,
            new Date(Date.now() - 30 * 60 * 1000)
          )
        )
      );
    if (!find)
      return res
        .status(400)
        .json({ success: false, message: "token not found." });

    const [user] = await db
      .select()
      .from(usersTable)
      .where(
        and(eq(usersTable.email, find.email), eq(usersTable.id, find.userId))
      );

    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "token not found." });

    return res.status(200).json({ success: true });
  }
);

router.post(
  "/reset-password",
  (req, res, next) =>
    BodyValidationMiddleware(req, res, next, resetPasswordSchema),
  async (req, res) => {
    const { token, password } = req.body;

    const [find] = await db
      .select()
      .from(resetPasswordTable)
      .where(
        and(
          eq(resetPasswordTable.token, token as string),
          eq(resetPasswordTable.used, false),
          gt(
            resetPasswordTable.createdAt,
            new Date(Date.now() - 30 * 60 * 1000)
          )
        )
      );

    if (!find)
      return res
        .status(400)
        .json({ success: false, message: "token not found." });

    const [user] = await db
      .select()
      .from(usersTable)
      .where(
        and(eq(usersTable.email, find.email), eq(usersTable.id, find.userId))
      );

    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "token not found" });

    await db
      .update(usersTable)
      .set({
        password: EncryptPassword(password),
      })
      .where(eq(usersTable.id, user.id));

    await db
      .update(resetPasswordTable)
      .set({
        used: true,
      })
      .where(eq(resetPasswordTable.id, find.id));

    return res.status(200).json({ success: true });
  }
);

export default router;
