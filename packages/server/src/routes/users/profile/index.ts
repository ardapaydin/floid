import express from "express";
import { db } from "../../../database/db";
import user from "../../../helpers/db/selects/user";
import {
  blockedUsersTable,
  commentsTable,
  communitiesTable,
  communityMembersTable,
  followersTable,
  usersTable,
  voteTable,
} from "../../../database";
import { and, count, desc, eq } from "drizzle-orm";
import { setCommentDetails } from "../../../helpers/details/comment";
import post from "../../../helpers/db/selects/post";
import { requireAuth } from "../../../helpers/middlewares/Auth";
const router = express.Router();

router.get("/:name/profile", async (req, res) => {
  const { name } = req.params;
  const [u] = await db
    .select(user)
    .from(usersTable)
    .where(eq(usersTable.username, name));

  if (!u)
    return res.status(404).json({ success: false, message: "user not found" });

  const comments = await db
    .select(post)
    .from(commentsTable)
    .where(eq(commentsTable.createdBy, u.id))
    .leftJoin(
      voteTable,
      and(
        eq(voteTable.commentId, commentsTable.id),
        eq(voteTable.userId, req.user?.id || "")
      )
    )
    .orderBy(desc(commentsTable.createdAt));
  let rep = 0;
  let commentsList = [];
  for (const comment of comments) {
    await setCommentDetails(comment);
    rep += (comment as any).votes;
    const [community] = await db
      .select()
      .from(communitiesTable)
      .where(eq(communitiesTable.id, comment.communityId!));
    (comment as any).community = community;

    if (
      community.visibility == "private" &&
      (!req.user?.id ||
        !(
          await db
            .select()
            .from(communityMembersTable)
            .where(
              and(
                eq(communityMembersTable.userId, req.user.id),
                eq(communityMembersTable.communityId, community.id)
              )
            )
        )?.[0])
    )
      continue;

    if (comment.relatedTo)
      (comment as any).relatedTitle = (
        await db
          .select()
          .from(commentsTable)
          .where(eq(commentsTable.id, comment.relatedTo))
      )?.[0].title;

    commentsList.push(comment);
  }

  const [{ count: followers }] = await db
    .select({ count: count() })
    .from(followersTable)
    .where(eq(followersTable.following, u.id));

  const [following] = await db
    .select()
    .from(followersTable)
    .where(
      and(
        eq(followersTable.userId, req.user?.id || ""),
        eq(followersTable.following, u.id)
      )
    );

  return res.status(200).json({
    ...u,
    rep,
    posts: commentsList.filter((x) => !x.replyTo),
    comments: commentsList.filter((x) => x.replyTo),
    followers,
    following: !!following,
  });
});

router.post("/:name/follow", requireAuth, async (req, res) => {
  const { name } = req.params;
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, name));
  if (!user)
    return res.status(404).json({ success: false, message: " user not found" });
  if (user.id == req.user?.id)
    return res
      .status(403)
      .json({ success: false, message: "cannot follow yourself" });

  const [blocked] = await db
    .select()
    .from(blockedUsersTable)
    .where(
      and(
        eq(blockedUsersTable.blockedBy, req.user!.id),
        eq(blockedUsersTable.blockedUser, user.id)
      )
    );
  if (blocked)
    return res
      .status(400)
      .json({ success: false, message: "Cannot follow blocked users" });

  const [blocked2] = await db
    .select()
    .from(blockedUsersTable)
    .where(
      and(
        eq(blockedUsersTable.blockedUser, req.user!.id),
        eq(blockedUsersTable.blockedBy, user.id)
      )
    );
  if (blocked2)
    return res
      .status(400)
      .json({ success: false, message: "Cannot follow this user" });
  const [following] = await db
    .select()
    .from(followersTable)
    .where(
      and(
        eq(followersTable.userId, req.user?.id!),
        eq(followersTable.following, user.id)
      )
    );

  if (following)
    return res
      .status(409)
      .json({ success: false, message: "already following this user" });

  const [{ id }] = await db
    .insert(followersTable)
    .values({
      userId: req.user?.id!,
      following: user.id,
    })
    .$returningId();

  return res.status(200).json({ success: true, data: { id, user: user.id } });
});

router.delete("/:name/follow", async (req, res) => {
  const { name } = req.params;
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, name));

  if (!user)
    return res.status(404).json({ success: false, message: "user not found" });
  if (user.id == req.user?.id)
    return res
      .status(403)
      .json({ success: false, message: "cannot follow yourself" });
  const [following] = await db
    .select()
    .from(followersTable)
    .where(
      and(
        eq(followersTable.userId, req.user!.id),
        eq(followersTable.following, user.id)
      )
    );

  if (!following)
    return res.status(400).json({ success: false, message: "not following" });

  await db.delete(followersTable).where(eq(followersTable.id, following.id));

  return res.status(200).json({ success: true });
});

export default router;
