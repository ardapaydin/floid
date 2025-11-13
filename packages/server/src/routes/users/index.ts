import express from "express";
import { db } from "../../database/db";
import { usersTable } from "../../database";
import { eq, inArray } from "drizzle-orm";
import BodyValidationMiddleware from "../../helpers/middlewares/BodyValidation";
import z from "zod";
import user from "../../helpers/db/selects/user";
const router = express.Router();

router.get("/me", async (req, res) => {
  if (!req.user?.id) return res.status(200).json({});

  const [user] = await db
    .select({
      id: usersTable.id,
      username: usersTable.username,
      displayName: usersTable.displayName,
      email: usersTable.email,
      emailVerified: usersTable.emailVerified,
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
    })
    .from(usersTable)
    .where(eq(usersTable.id, req.user.id));

  return res.status(200).json({ user });
});

router.post(
  "/details",
  (req, res, next) =>
    BodyValidationMiddleware(
      req,
      res,
      next,
      z.object({ userIds: z.array(z.string()) })
    ),
  async (req, res) => {
    const { userIds } = req.body;

    const users = await db
      .select(user)
      .from(usersTable)
      .where(inArray(usersTable.id, userIds));

    return res.status(200).json({ users });
  }
);

export default router;
