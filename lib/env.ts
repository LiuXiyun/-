import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  ADMIN_PASSWORD: z.string().min(8, "ADMIN_PASSWORD 至少 8 位"),
  ADMIN_SESSION_SECRET: z.string().min(16, "ADMIN_SESSION_SECRET 至少 16 位"),
  ENCRYPTION_SECRET: z.string().min(16, "ENCRYPTION_SECRET 至少 16 位"),
  USER_SESSION_SECRET: z.string().min(16, "USER_SESSION_SECRET 至少 16 位"),
  CNY_PER_USD: z.coerce.number().positive(),
  CHAT_PRICE_MULTIPLIER: z.coerce.number().positive(),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL ?? "file:./dev.db",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? "admin12345",
  ADMIN_SESSION_SECRET:
    process.env.ADMIN_SESSION_SECRET ?? "admin_session_secret_32_chars",
  ENCRYPTION_SECRET: process.env.ENCRYPTION_SECRET ?? "encryption_secret_32_chars_value",
  USER_SESSION_SECRET:
    process.env.USER_SESSION_SECRET ?? process.env.ADMIN_SESSION_SECRET ?? "user_session_secret_32_chars",
  CNY_PER_USD: process.env.CNY_PER_USD ?? "7.2",
  CHAT_PRICE_MULTIPLIER: process.env.CHAT_PRICE_MULTIPLIER ?? "1.2",
});
