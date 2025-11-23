import z from "zod";

export const updateUserSchema = z.object({
  email: z.email().optional(),
  displayName: z.string().max(32).trim().min(1).optional(),
  password: z
    .string()
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-={}\[\]:;"'<>,.?/\\|~`]{6,}$/,
      "Password must be at least 6 characters long and include both letters and numbers"
    )
    .optional(),
  newPassword: z
    .string()
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-={}\[\]:;"'<>,.?/\\|~`]{6,}$/,
      "New Password must be at least 6 characters long and include both letters and numbers"
    )
    .optional(),
});
