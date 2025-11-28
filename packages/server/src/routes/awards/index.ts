import express from "express";
import awards from "../../data/awards";
import { requireAuth } from "../../helpers/middlewares/Auth";
import { db } from "../../database/db";
import { commentsTable, usedReputationsTable } from "../../database";
import { eq } from "drizzle-orm";
import { setCommentDetails } from "../../helpers/details/comment";
const router = express.Router();

router.get("/", async (req, res) => {
  return res.status(200).json(awards);
});

router.get("/balance", requireAuth, async (req, res) => {
  const comments = await db
    .select()
    .from(commentsTable)
    .where(eq(commentsTable.createdBy, req.user!.id));

  let reputation = 0;
  for (const comment of comments) {
    await setCommentDetails(comment);
    reputation += (comment as any).votes;
  }

  const [used] = await db
    .select()
    .from(usedReputationsTable)
    .where(eq(usedReputationsTable.userId, req.user!.id));

  reputation -= used?.used || 0;

  return res.status(200).json({ success: true, balance: reputation });
});

export default router;
