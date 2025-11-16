import { NextFunction, Request, Response } from "express";
import { db } from "../../database/db";
import { communitiesTable, communityMembersTable } from "../../database";
import { and, eq } from "drizzle-orm";

export default async function CanAccessCommunity(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { name } = req.params;
  const [findCommunity] = await db
    .select()
    .from(communitiesTable)
    .where(eq(communitiesTable.name, name));

  if (!findCommunity)
    return res
      .status(404)
      .json({ success: false, message: "Community not found." });

  if (
    findCommunity.visibility == "private" &&
    (!req.user?.id ||
      !(
        await db
          .select()
          .from(communityMembersTable)
          .where(
            and(
              eq(communityMembersTable.userId, req.user.id),
              eq(communityMembersTable.communityId, findCommunity.id)
            )
          )
      )?.[0])
  )
    return res
      .status(404)
      .json({ success: false, message: "Community not found." });

  next();
}
