import { NextFunction, Request, Response } from "express";
import { db } from "../../database/db";
import { banTable, communitiesTable } from "../../database";
import { and, eq } from "drizzle-orm";

export default async function BanCheck(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { name } = req.params;
  const [findCommunity] = await db
    .select()
    .from(communitiesTable)
    .where(eq(communitiesTable.name, name));
  const [ban] = await db
    .select()
    .from(banTable)
    .where(
      and(
        eq(banTable.userId, req.user!.id),
        eq(banTable.communityId, findCommunity.id)
      )
    );

  if (ban && (!ban.expiresAt || new Date() < new Date(ban.expiresAt)))
    return res.status(403).json({
      success: false,
      message: "User is banned from this community.",
    });

  next();
}
