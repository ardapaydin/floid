import express from "express";
import { db } from "../../database/db";
import { usersTable } from "../../database";
import { eq } from "drizzle-orm";
const router = express.Router();
import profileRouter from "./profile";

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

router.use(profileRouter);

export default router;
