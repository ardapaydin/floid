import express from "express";
import { db } from "../../../database/db";
import user from "../../../helpers/db/selects/user";
import {
  commentsTable,
  communitiesTable,
  communityMembersTable,
  usersTable,
  voteTable,
} from "../../../database";
import { and, asc, desc, eq } from "drizzle-orm";
import { setCommentDetails } from "../../../helpers/details/comment";
import post from "../../../helpers/db/selects/post";
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

    commentsList.push(comment);
  }

  return res
    .status(200)
    .json({ ...u, rep, posts: commentsList.filter((x) => !x.replyTo) });
});

export default router;
