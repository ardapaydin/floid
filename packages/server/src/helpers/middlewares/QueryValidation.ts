import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";
import { ErrorStyle } from "../validations/error";
export default async function QueryValidationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
  schema: ZodObject
) {
  const validate = await schema.safeParseAsync(req.query);
  if (!validate.success)
    return res.status(400).json(ErrorStyle(validate.error));

  next();
}
