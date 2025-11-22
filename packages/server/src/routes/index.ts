import express from "express";
const router = express.Router();
import AuthRouter from "./auth";
import UsersRouter from "./users";
import FeedRouter from "./feed";
import CommunitiesRouter from "./communities";
import { verifyToken } from "../helpers/auth/jwt";
import { db } from "../database/db";
import { count, eq } from "drizzle-orm";
import { usersTable } from "../database";

router.use(async (req, res, next) => {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer")) {
    try {
      const { id } = verifyToken(header.split(" ")[1]);
      const [{ value }] = await db
        .select({ value: count() })
        .from(usersTable)
        .where(eq(usersTable.id, id));
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

export default router;
