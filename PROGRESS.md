# PROGRESS.md — دفترچهٔ خاطرات پروژهٔ طلاسنج

قانون: آخر هر جلسهٔ کاری، عامل AI این فایل را به‌روز می‌کند؛ اول هر جلسه، این فایل خوانده می‌شود.

## وضعیت کلی

- فاز فعلی: ۲ (ساخت صفحه‌به‌صفحه)
- آخرین اسپرینت کامل‌شده: S3
- تاریخ آخرین به‌روزرسانی: ۱۴۰۵/۰۵/۲۴

## انجام‌شده

- [x] S0 — اسکلت Next.js 15 + TypeScript strict + Tailwind v4 راست‌به‌چپ + فونت Vazirmatn + ۴۰۴ سفارشی + robots.txt
- [x] S1 — مدل داده با Drizzle + PostgreSQL (Neon): ۷ جدول + seed اولیه + صفحهٔ تست `/dev/db-check`
- [x] S2 — دیزاین سیستم: توکن‌های کامل + ۱۴ کامپوننت در `components/` + گالری `/dev/design` + `lib/format.ts`
- [x] S3 — قالب پروفایل پلتفرم `/platforms/[slug]/` با ۱۷ سکشن (§۴.۲ سند ساختار): بردکرامب + JSON-LD (Organization، BreadcrumbList، FAQPage)، هدر با نشان‌ها، خلاصهٔ اتمی، کارت اقدام `/go/[slug]`، FeeTable از دیتابیس، امتیاز تفکیک‌شده (حالت نامشخص تا S4)، مجوزها، EmptyStateهای صادقانه، FAQ تولیدشده از داده، منابع خودکار، ReportDataButton
- [x] مسیر خروجی `/go/[slug]` (ریدایرکت ۳۰۲ از دیتابیس، X-Robots-Tag: noindex؛ ضد open redirect)
- [x] لایهٔ دسترسی داده `lib/data/platforms.ts` + metadataBase در layout

## در حال انجام

- (خالی)

## قدم بعدی (جلسهٔ بعد)

- S4 — موتور امتیازدهی `lib/scoring/`: شش محور با وزن‌های ۲۵/۲۵/۱۵/۱۵/۱۰/۱۰، سقف ۷۵ برای «دادهٔ ناکامل»، سرکوب امتیاز با پرچم‌های ریسک، حداقل ۵ تست طلایی با Vitest، اتصال خروجی به ScoreBadge و سکشن ۷ پروفایل.

## خطاها و مسائل باز

- لینک‌های `/platforms/` و `/methods/` و `/compare/` در پروفایل فعلاً ۴۰۴ می‌دهند؛ دایرکتوری در S6 و روش‌ها در S7 ساخته می‌شوند — طبیعی است.

## تصمیم‌های قفل‌شده

- استک: Next.js 15 + TypeScript strict + Tailwind v4 + PostgreSQL (Neon) + Drizzle + Zod + MDX
- رنگ‌ها: ‎--bg-base ‎#0F1115 ، ‎--bg-surface ‎#171A21 ، ‎--gold ‎#C9A227 ، ‎--cream ‎#F5F1E6 ، ‎--positive ‎#4CAF7D ، ‎--negative ‎#E35D5D ، ‎--warning ‎#E0A93E ، ‎--muted ‎#9AA3B2
- فونت: Vazirmatn (خودمیزبان از طریق @fontsource)
- دادهٔ واقعی فقط با منبع و تاریخ؛ دادهٔ نمایشی فقط با example-platform
- اتصال دیتابیس فقط از طریق getDb() در db/index.ts و متغیر DATABASE_URL در .env.local (هرگز در گیت commit نمی‌شود)
- صفحات داخلی توسعه (noindex) زیر مسیر `/dev/` می‌آیند
- رندر صفحات داده‌دار: ISR با revalidate پیش‌فرض ۳۶۰۰ ثانیه
