import { z } from "zod";

export const emailSchema = z.object({
  email: z
    .string()
    .min(1, "Please enter your email address.")
    .max(255, "Email address is too long.")
    .email("Please enter a valid work email address.")
    .transform((v) => v.trim().toLowerCase()),
});

export const passwordSchema = z.object({
  password: z
    .string()
    .min(1, "Please enter your password.")
    .min(8, "Password must be at least 8 characters."),
});

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "Please enter the 6-digit code.")
    .regex(/^\d{6}$/, "The code must contain digits only."),
});

export type EmailFormValues    = z.infer<typeof emailSchema>;
export type PasswordFormValues = z.infer<typeof passwordSchema>;
export type OtpFormValues      = z.infer<typeof otpSchema>;
