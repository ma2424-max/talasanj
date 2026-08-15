# PROGRESS.md — دفترچهٔ خاطرات پروژهٔ طلاسنج

قانون: آخر هر جلسهٔ کاری، عامل AI این فایل را به‌روز می‌کند؛ اول هر جلسه، این فایل خوانده می‌شود.

## وضعیت کلی

- فاز فعلی: ۲ (ساخت صفحه‌به‌صفحه)
- آخرین اسپرینت کامل‌شده: S2
- تاریخ آخرین به‌روزرسانی: ۱۴۰۵/۰۵/۲۴

## انجام‌شده

- [x] S0 — اسکلت Next.js 15 (App Router) + TypeScript strict + Tailwind v4 راست‌به‌چپ + فونت Vazirmatn + صفحهٔ اصلی موقت + ۴۰۴ سفارشی + robots.txt
- [x] S1 — مدل داده با Drizzle + PostgreSQL (Neon): جداول platforms، platform_fees، licenses، methods، funds، reviews، data_change_log + seed اولیه (۷ روش + پلتفرم نمایشی) + صفحهٔ تست `/dev/db-check`
- [x] S2 — دیزاین سیستم: توکن‌های کامل رنگ (positive/negative/warning/muted) + تایپوگرافی (Vazirmatn، line-height ۱.۸، tnum، measure ۷۵ch) + قواعد دسترس‌پذیری (focus-visible، reduced-motion) + هر ۱۴ کامپوننت در `components/` + گالری داخلی `/dev/design` (noindex) + توابع فرمت فارسی در `lib/format.ts`
- [x] اعتبارسنجی seed با Zod (`lib/schemas/platform.ts`)
- [x] فایل پیکربندی `data/config/assumptions.json` (نرخ مالیات هنوز null — قبل از پرتاب باید تأیید شود)

## در حال انجام

- (خالی)

## قدم بعدی (جلسهٔ بعد)

- S3 — قالب پروفایل پلتفرم در مسیر `/platforms/[slug]/` طبق §۴.۲ سند ساختار صفحات (۱۷ سکشن): هدر با نشان‌ها، خلاصهٔ اتمی، کارت اقدام /go/، FeeTable، امتیاز تفکیک‌شده (placeholder تا S4)، مجوزها، جزئیات عملیاتی، EmptyState نظرات (تا S9)، مقایسهٔ سریع، تاریخچهٔ داده، FAQ، منابع، ReportDataButton، لینک‌های مرتبط.
- نکتهٔ فنی: پوشه‌هایی که با `_` شروع می‌شوند در Next.js روت نمی‌شوند؛ صفحات داخلی زیر `/dev/` می‌آیند.

## خطاها و مسائل باز

- (خالی)

## تصمیم‌های قفل‌شده

- استک: Next.js 15 + TypeScript strict + Tailwind v4 + PostgreSQL (Neon) + Drizzle + Zod + MDX
- رنگ‌ها: ‎--bg-base ‎#0F1115 ، ‎--bg-surface ‎#171A21 ، ‎--gold ‎#C9A227 ، ‎--cream ‎#F5F1E6 ، ‎--positive ‎#4CAF7D ، ‎--negative ‎#E35D5D ، ‎--warning ‎#E0A93E ، ‎--muted ‎#9AA3B2
- فونت: Vazirmatn (خودمیزبان از طریق @fontsource)
- دادهٔ واقعی فقط با منبع و تاریخ؛ دادهٔ نمایشی فقط با example-platform
- اتصال دیتابیس فقط از طریق getDb() در db/index.ts و متغیر DATABASE_URL در .env.local (هرگز در گیت commit نمی‌شود)
- صفحات داخلی توسعه (noindex) زیر مسیر `/dev/` می‌آیند
