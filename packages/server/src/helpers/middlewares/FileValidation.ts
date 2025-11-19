import { NextFunction, Request, Response } from "express";

export default function FileValidationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
  key: string,
  config: {
    maxSize: number;
    mimetype: string;
  }
) {
  let errors: { [key: string]: string[] } = {};

  const file = req.files?.[key];
  if (!file) errors["file"] = ["File not uploaded"];
  else if (Array.isArray(file)) errors["file"] = ["Multiple files uploaded"];
  else {
    if (file.size > config.maxSize) errors["file"] = ["File exceeds limit."];
    else if (!file.mimetype.startsWith(config.mimetype))
      errors["file"] = ["Invalid file type."];
  }

  if (Object.keys(errors).length)
    return res.status(400).json({
      success: false,
      message: "bad request",
      errors,
    });

  next();
}
