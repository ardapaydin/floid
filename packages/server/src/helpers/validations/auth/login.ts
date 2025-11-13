import z from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-={}\[\]:;"'<>,.?/\\|~`]{6,}$/,
      "Password must be at least 6 characters long and include both letters and numbers"
    ),
});
