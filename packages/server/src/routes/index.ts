import express from "express";
const router = express.Router();
import AuthRouter from "./auth";
import UsersRouter from "./users";
import FeedRouter from "./feed";
import ExploreRouter from "./explore";
import CommunitiesRouter from "./communities";
import InvitesRouter from "./invites";
import { verifyToken } from "../helpers/auth/jwt";
import { db } from "../database/db";
import { and, count, eq, isNull } from "drizzle-orm";
import { loggedOutTokensTable, usersTable } from "../database";

router.use(async (req, res, next) => {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer")) {
    try {
      const { id } = verifyToken(header.split(" ")[1]);

      const [findtoken] = await db
        .select()
        .from(loggedOutTokensTable)
        .where(eq(loggedOutTokensTable.token, header.split(" ")[1]));
      if (findtoken) return next();

      const [{ value }] = await db
        .select({ value: count() })
        .from(usersTable)
        .where(and(eq(usersTable.id, id), isNull(usersTable.status)));
      if (value) {
        res.setHeader("X-User-Id", id);
        req.user = { id };
      }
    } catch (e) {
      console.log(e);
    }
  }
  next();
});

router.use("/auth", AuthRouter);
router.use("/users", UsersRouter);
router.use("/community", CommunitiesRouter);
router.use("/feed", FeedRouter);
router.use("/explore", ExploreRouter);
router.use("/invites", InvitesRouter);

export default router;
