import { z } from "zod";
export const emailSchema = z.email("Enter a valid email address.");
export const passwordSchema = z
  .string()
  .min(12, "Use at least 12 characters.")
  .max(128);
export const authSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
