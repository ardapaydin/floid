import z from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .max(32)
    .trim()
    .min(1)
    .toLowerCase()
    .regex(/^[a-zA-Z0-9]+$/, "Username can only contain letters and numbers"),
  email: z.email().toLowerCase(),
  password: z
    .string()
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-={}\[\]:;"'<>,.?/\\|~`]{6,}$/,
      "Password must be at least 6 characters long and include both letters and numbers"
    ),
});
