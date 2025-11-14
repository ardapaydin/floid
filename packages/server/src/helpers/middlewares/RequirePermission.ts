import { NextFunction, Request, Response } from "express";
import permissions from "../permissions/permissions";
import { db } from "../../database/db";
import { communityMembersTable } from "../../database";
import { and, eq } from "drizzle-orm";
import getPermissions from "../permissions/getPermissions";

export default async function RequirePermission(
  req: Request,
  res: Response,
  next: NextFunction,
  permission: string
) {
  const { id } = req.params;
  const perm = permissions.get(permission);
  const [member] = await db
    .select()
    .from(communityMembersTable)
    .where(
      and(
        eq(communityMembersTable.userId, req.user!.id),
        eq(communityMembersTable.communityId, id)
      )
    );

  if (!member)
    return res
      .status(403)
      .json({ success: false, message: "Not a member of community" });

  const check = await getPermissions(req.user!.id, id);
  const has = Boolean(BigInt(check ?? "0") & BigInt(perm ?? 0));

  if (!has)
    return res
      .status(403)
      .json({ success: false, message: `Missing ${permission} permission` });

  next();
}
