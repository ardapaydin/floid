import express from "express";
import BodyValidationMiddleware from "../../helpers/middlewares/BodyValidation";
import { registerSchema } from "../../helpers/validations/auth/register";
import { db } from "../../database/db";
import { count, eq } from "drizzle-orm";
import { usersTable } from "../../database";
import {
  ComparePassword,
  EncryptPassword,
} from "../../helpers/encryptions/password";
import { loginSchema } from "../../helpers/validations/auth/login";
import { requireAuth, requireNoAuth } from "../../helpers/middlewares/Auth";
import { signToken } from "../../helpers/auth/jwt";
import { createToken } from "../../email/verification/generateToken";
import EmailRouter from "./email";
import PasswordRouter from "./password";
import { loggedOutTokensTable } from "../../database/schemas/loggedOut";
const router = express.Router();
router.use(EmailRouter);
router.use(PasswordRouter);
router.post(
  "/register",
  requireNoAuth,
  (req, res, next) => BodyValidationMiddleware(req, res, next, registerSchema),
  async (req, res) => {
    const { email, password, username } = req.body;

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

    const [{ id }] = await db
      .insert(usersTable)
      .values({
        username,
        displayName: username,
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

router.post("/logout", requireAuth, async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")?.[1]!;
  await db.insert(loggedOutTokensTable).values({ token });
  return res.status(200).json({ success: true });
});

export default router;
