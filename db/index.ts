import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * ساخت اتصال دیتابیس. عمداً «تنبل» است تا اگر DATABASE_URL
 * فراموش شده باشد، خطای واضح فارسی به جای کرش بی‌معنی بگیریم.
 * Next.js خودش .env.local را می‌خواند؛ اسکریپت‌ها dotenv دارند.
 */
export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL تنظیم نشده است؛ فایل .env.local را کنار package.json بساز و رشتهٔ اتصال Neon را در آن بگذار.",
    );
  }
  return drizzle(neon(url), { schema });
}
