import Express from "express";
export function requireAuth(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) {
  if (!req.user?.id)
    return res.status(401).json({ success: false, message: "Unauthorized" });
  next();
}

export function requireNoAuth(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) {
  if (req.user?.id)
    return res.status(403).json({ success: false, message: "Forbidden" });
  next();
}
