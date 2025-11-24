import z from "zod";

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-={}\[\]:;"'<>,.?/\\|~`]{6,}$/,
      "Password must be at least 6 characters long and include both letters and numbers"
    ),
  token: z.string(),
});
