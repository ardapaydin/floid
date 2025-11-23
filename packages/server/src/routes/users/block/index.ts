import express from "express";
import { requireAuth } from "../../../helpers/middlewares/Auth";
import { db } from "../../../database/db";
import {
  blockedUsersTable,
  followersTable,
  usersTable,
} from "../../../database";
import { and, eq, inArray, or } from "drizzle-orm";
import user from "../../../helpers/db/selects/user";
const router = express.Router();

router.get("/me/blocked", requireAuth, async (req, res) => {
  const blocked = await db
    .select()
    .from(blockedUsersTable)
    .where(eq(blockedUsersTable.blockedBy, req.user!.id));

  const users = await db
    .select(user)
    .from(usersTable)
    .where(
      inArray(
        usersTable.id,
        blocked.map((x) => x.blockedUser)
      )
    );

  return res.status(200).json(users);
});

router.post("/:name/block", requireAuth, async (req, res) => {
  const { name } = req.params;
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, name));

  if (!user)
    return res.status(400).json({ success: false, message: "user not found" });
  if (user.id == req.user!.id)
    return res
      .status(400)
      .json({ success: false, message: "cannot block yourself" });

  const [block] = await db
    .select()
    .from(blockedUsersTable)
    .where(
      and(
        eq(blockedUsersTable.blockedBy, req.user!.id),
        eq(blockedUsersTable.blockedUser, user.id)
      )
    );
  if (block)
    return res
      .status(409)
      .json({ success: false, message: "Already blocked this user" });

  await db.insert(blockedUsersTable).values({
    blockedBy: req.user!.id,
    blockedUser: user.id,
  });

  await db
    .delete(followersTable)
    .where(
      and(
        or(
          and(
            eq(followersTable.userId, req.user!.id),
            eq(followersTable.following, user.id)
          ),
          and(
            eq(followersTable.following, req.user!.id),
            eq(followersTable.userId, user.id)
          )
        )
      )
    );
  return res.status(200).json({ success: true });
});

router.delete("/:name/block", requireAuth, async (req, res) => {
  const { name } = req.params;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, name));
  if (!user)
    return res.status(400).json({ success: false, message: "User not found" });
  if (user.id == req.user!.id)
    return res.status(400).json({
      success: false,
      message: "username cannot be your name",
    });

  const [block] = await db
    .select()
    .from(blockedUsersTable)
    .where(
      and(
        eq(blockedUsersTable.blockedBy, req.user!.id),
        eq(blockedUsersTable.blockedUser, user.id)
      )
    );

  if (!block)
    return res
      .status(400)
      .json({ success: false, message: "This user is not blocked" });

  await db.delete(blockedUsersTable).where(eq(blockedUsersTable.id, block.id));

  return res.status(200).json({ success: true });
});

export default router;
