# طلاسنج (talasanj.org)

سایت مستقل مقایسه و امتیازدهی پلتفرم‌های خرید طلای آنلاین.

## راه‌اندازی روی کامپیوتر (بار اول)

1. `npm install` — نصب وابستگی‌ها (چند دقیقه)
2. فایل `.env.local` را کنار `package.json` بساز و داخلش بنویس:
   `DATABASE_URL="رشتهٔ اتصال Neon"` — نمونه در `.env.example`
3. `npm run db:push` — ساخت جداول در دیتابیس
4. `npm run db:seed` — پرکردن دادهٔ اولیه (۷ روش + پلتفرم نمایشی)
5. `npm run dev` — اجرا روی http://localhost:3000

## بررسی سلامت دیتابیس

بعد از اجرا، مسیر http://localhost:3000/dev/db-check را باز کن (صفحهٔ داخلی، noindex).

## اسکریپت‌ها

| دستور | کار |
| --- | --- |
| `npm run dev` | اجرای سایت روی کامپیوتر |
| `npm run build` / `npm start` | ساخت و اجرای نسخهٔ نهایی |
| `npm run typecheck` | بررسی خطاهای TypeScript |
| `npm run db:push` | همگام‌سازی جداول دیتابیس با `db/schema.ts` |
| `npm run db:seed` | پرکردن دادهٔ اولیه از `data/seed/platforms.json` |
| `npm run db:studio` | باز کردن رابط دیداری جداول (Drizzle Studio) |

## قوانین کار

- قبل از هر کار با AI، فایل `AGENTS.md` را به او بده.
- وضعیت پروژه همیشه در `PROGRESS.md` به‌روز است.
- رمزها و رشته‌های اتصال فقط در `.env.local` می‌مانند و هرگز commit نمی‌شوند.
- اسناد مرجع (سند ساخت + سند ساختار صفحات) در Notion نگهداری می‌شوند.
