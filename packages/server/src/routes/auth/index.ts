import express from "express";
import BodyValidationMiddleware from "../../helpers/middlewares/BodyValidation";
import { registerSchema } from "../../helpers/validations/auth/register";
import { db } from "../../database/db";
import { count, eq } from "drizzle-orm";
import { usersTable } from "../../database";
import createId from "../../helpers/id/createId";
import {
  ComparePassword,
  EncryptPassword,
} from "../../helpers/encryptions/password";
import { loginSchema } from "../../helpers/validations/auth/login";
import { requireNoAuth } from "../../helpers/middlewares/Auth";
import { signToken } from "../../helpers/auth/jwt";
import { createToken } from "../../email/verification/generateToken";
import EmailRouter from "./email";
const router = express.Router();
router.use(EmailRouter);
router.post(
  "/register",
  requireNoAuth,
  (req, res, next) => BodyValidationMiddleware(req, res, next, registerSchema),
  async (req, res) => {
    const { email, password, username: displayName } = req.body;

    const [findEmail] = await db
      .select({ find: count(usersTable.id) })
      .from(usersTable)
      .where(eq(usersTable.email, email));
    if (findEmail.find)
      return res.status(400).json({
        success: false,
        message: "Email already registered.",
        errors: { email: ["Email already registered."] },
      });

    let username = (displayName ?? "")
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");

    const [findUsername] = await db
      .select({ find: count(usersTable.id) })
      .from(usersTable)
      .where(eq(usersTable.username, username));
    if (findUsername.find)
      return res.status(400).json({
        success: false,
        message: "Username exists",
        errors: { username: ["Username already exists"] },
      });
    if (!findUsername.find || !username.trim()) username = createId();

    const [{ id }] = await db
      .insert(usersTable)
      .values({
        username,
        displayName,
        email,
        password: EncryptPassword(password),
      })
      .$returningId();

    res.status(200).json({
      success: true,
      data: {
        userId: id,
        token: signToken(id),
      },
    });
    await createToken(email);
  }
);

router.post(
  "/login",
  requireNoAuth,
  (req, res, next) => BodyValidationMiddleware(req, res, next, loginSchema),
  async (req, res) => {
    const { email, password } = req.body;
    const [find] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));
    if (!find)
      return res.status(401).json({
        success: false,
        message: "auth failed",
        errors: {
          email: ["The email address or password is incorrect."],
        },
      });

    if (!ComparePassword(password, find.password))
      return res.status(401).json({
        success: false,
        message: "auth failed",
        errors: {
          email: ["The email address or password is incorrect."],
        },
      });

    return res.status(200).json({
      success: true,
      data: {
        userId: find.id,
        token: signToken(find.id),
      },
    });
  }
);

export default router;
