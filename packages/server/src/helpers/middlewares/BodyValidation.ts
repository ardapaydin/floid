import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";
import { ErrorStyle } from "../validations/error";
export default async function BodyValidationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
  schema: ZodObject
) {
  const validate = await schema.safeParseAsync(req.body);
  if (!validate.success) {
    const { error } = validate;
    if (
      error.issues.some(
        (issue) => !issue.path.length && issue.code == "invalid_type"
      )
    )
      return res
        .status(400)
        .json({ success: false, message: "Content-Type header is missing" });

    return res.status(400).json(ErrorStyle(error));
  }

  next();
}
