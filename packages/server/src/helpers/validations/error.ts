import { ZodError } from "zod";

export function ErrorStyle(error: ZodError) {
  const errors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".") || "body";
    if (!errors[path]) errors[path] = [];
    errors[path].push(issue.message);
  }

  return {
    success: false,
    message: "bad request",
    errors,
  };
}
