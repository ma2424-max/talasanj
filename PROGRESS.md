# PROGRESS.md — دفترچهٔ خاطرات پروژهٔ طلاسنج

قانون: آخر هر جلسهٔ کاری، عامل AI این فایل را به‌روز می‌کند؛ اول هر جلسه، این فایل خوانده می‌شود.

## وضعیت کلی

- فاز فعلی: ۲ (ساخت صفحه‌به‌صفحه)
- آخرین اسپرینت کامل‌شده: S5
- تاریخ آخرین به‌روزرسانی: ۱۴۰۵/۰۵/۲۴

## انجام‌شده

- [x] S0 — اسکلت Next.js 15 + TypeScript strict + Tailwind v4 راست‌به‌چپ + فونت Vazirmatn + ۴۰۴ سفارشی + robots.txt
- [x] S1 — مدل داده با Drizzle + PostgreSQL (Neon): ۷ جدول + seed اولیه + صفحهٔ تست `/dev/db-check`
- [x] S2 — دیزاین سیستم: توکن‌های کامل + ۱۴ کامپوننت در `components/` + گالری `/dev/design` + `lib/format.ts`
- [x] S3 — قالب پروفایل پلتفرم `/platforms/[slug]/` با ۱۷ سکشن + مسیر خروجی `/go/[slug]` + لایهٔ `lib/data/platforms.ts`
- [x] S4 — موتور امتیازدهی `lib/scoring/` + ۷ تست طلایی Vitest + اتصال زنده به پروفایل
- [x] S5 — ابزار شاخص «محاسبه‌گر هزینهٔ واقعی»: `lib/calc/real-cost.ts` (تابع خالص) + ۶ تست طلایی + هاب `/tools/` + صفحهٔ `/tools/real-cost/` با رتبه‌بندی پلتفرم‌ها، noindex برای URLهای پارامتردار و canonical تمیز + کامپوننت‌های مشترک RealCostForm و RealCostResult + اتصال به سکشن ۶ پروفایل + `lib/config.ts` (نرخ مالیات فقط از assumptions.json؛ فعلاً null با هشدار شفاف)

## در حال انجام

- (خالی)

## قدم بعدی (جلسهٔ بعد)

- S6 — دایرکتوری `/platforms/` با FilterBar (فرم GET) و جدول CompareTable و CompareTray تعاملی + صفحهٔ `/compare/[a]-vs-[b]/` + شش صفحهٔ `/best/[criterion]/` + تکمیل صفحهٔ اصلی با ۱۰ سکشن §۳.۱ سند ساختار + لاگ کلیک `/go/` + صفحهٔ `/search/` (noindex).

## خطاها و مسائل باز

- لینک‌های `/methods/` و `/compare/` فعلاً ۴۰۴ می‌دهند؛ در S6 و S7 ساخته می‌شوند — طبیعی است.

## تصمیم‌های قفل‌شده

- استک: Next.js 15 + TypeScript strict + Tailwind v4 + PostgreSQL (Neon) + Drizzle + Zod + Vitest
- رنگ‌ها: ‎--bg-base ‎#0F1115 ، ‎--bg-surface ‎#171A21 ، ‎--gold ‎#C9A227 ، ‎--cream ‎#F5F1E6 ، ‎--positive ‎#4CAF7D ، ‎--negative ‎#E35D5D ، ‎--warning ‎#E0A93E ، ‎--muted ‎#9AA3B2
- فونت: Vazirmatn (خودمیزبان از طریق @fontsource)
- دادهٔ واقعی فقط با منبع و تاریخ؛ دادهٔ نمایشی فقط با example-platform
- اتصال دیتابیس فقط از طریق getDb() در db/index.ts و متغیر DATABASE_URL در .env.local (هرگز در گیت commit نمی‌شود)
- صفحات داخلی توسعه (noindex) زیر مسیر `/dev/` می‌آیند
- رندر صفحات داده‌دار: ISR با revalidate پیش‌فرض ۳۶۰۰ ثانیه
- هر فرمول مالی بدون حداقل ۵ تست طلایی منتشر نمی‌شود (`npm test` باید سبز باشد)
- URLهای نتیجهٔ ابزار (پارامتردار) noindex و canonical به نسخهٔ تمیز
