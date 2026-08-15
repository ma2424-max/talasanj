# PROGRESS.md — دفترچهٔ خاطرات پروژهٔ طلاسنج

قانون: آخر هر جلسهٔ کاری، عامل AI این فایل را به‌روز می‌کند؛ اول هر جلسه، این فایل خوانده می‌شود.

## وضعیت کلی

- فاز فعلی: ۲ (ساخت صفحه‌به‌صفحه)
- آخرین اسپرینت کامل‌شده: S1
- تاریخ آخرین به‌روزرسانی: ۱۴۰۵/۰۵/۲۴

## انجام‌شده

- [x] S0 — اسکلت Next.js 15 (App Router) + TypeScript strict + Tailwind v4 راست‌به‌چپ + فونت Vazirmatn + صفحهٔ اصلی موقت + ۴۰۴ سفارشی + robots.txt
- [x] S1 — مدل داده با Drizzle + PostgreSQL (Neon): جداول platforms، platform_fees، licenses، methods، funds، reviews، data_change_log
- [x] seed اولیه: ۷ روش خرید + پلتفرم نمایشی `example-platform` با برچسب «دادهٔ نمایشی»
- [x] فایل پیکربندی `data/config/assumptions.json` (نرخ مالیات هنوز null — قبل از پرتاب باید از سازمان امور مالیاتی تأیید شود)
- [x] صفحهٔ داخلی تست دیتابیس: `/dev/db-check` (noindex)
- [x] اعتبارسنجی seed با Zod (`lib/schemas/platform.ts`)

## در حال انجام

- (خالی)

## قدم بعدی (جلسهٔ بعد)

- S2 — دیزاین سیستم: ساخت ۱۴ کامپوننت §۱۵.۳ سند ساخت در `components/` (ScoreBadge، DataFreshnessBadge، ConfidenceTag، SourceCite، FeeTable، CompareTable، CompareTray، FilterBar، RiskFlag، ToolPanel، DisclosureBanner، CorrectionNotice، ReportDataButton، EmptyState) + صفحهٔ داخلی گالری کامپوننت در مسیر `/dev/design` (noindex).
- نکتهٔ فنی: پوشه‌هایی که با `_` شروع می‌شوند در Next.js روت نمی‌شوند؛ به همین دلیل گالری دیزاین در `/dev/design` می‌آید، نه `/_design`.

## خطاها و مسائل باز

- (خالی)

## تصمیم‌های قفل‌شده

- استک: Next.js 15 + TypeScript strict + Tailwind v4 + PostgreSQL (Neon) + Drizzle + Zod + MDX
- رنگ‌ها: ‎--bg-base ‎#0F1115 ، ‎--bg-surface ‎#171A21 ، ‎--gold ‎#C9A227 ، ‎--cream ‎#F5F1E6
- فونت: Vazirmatn (خودمیزبان از طریق @fontsource)
- دادهٔ واقعی فقط با منبع و تاریخ؛ دادهٔ نمایشی فقط با example-platform
- اتصال دیتابیس فقط از طریق getDb() در db/index.ts و متغیر DATABASE_URL در .env.local (هرگز در گیت commit نمی‌شود)
