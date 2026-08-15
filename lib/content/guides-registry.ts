/**
 * رجیستری صفحات راهنما — هر راهنمای MDX باید اینجا هم ثبت شود تا در هاب دیده شود.
 * (metadata داخل خود فایل MDX هم هست؛ اینجا فقط برای لیست‌کردن است)
 */

export type GuideEntry = {
  slug: string;
  title: string;
  description: string;
  updatedAt: string;
  readMinutes: number;
};

export const GUIDES: GuideEntry[] = [
  {
    slug: "start-gold-buying",
    title: "راهنمای کامل شروع خرید طلای آنلاین",
    description:
      "از صفر تا اولین خرید: انتخاب روش، انتخاب پلتفرم امن، احراز هویت، اولین خرید کوچک و تست برداشت.",
    updatedAt: "2026-08-15",
    readMinutes: 8,
  },
  {
    slug: "fees-guide",
    title: "کارمزد و هزینه‌های خرید طلا چیست؟",
    description:
      "همهٔ هزینه‌هایی که در مسیر خرید طلا می‌پردازی: کارمزد، اجرت، اسپرد، مالیات و هزینهٔ تحویل.",
    updatedAt: "2026-08-15",
    readMinutes: 6,
  },
  {
    slug: "gold-vs-coin-vs-fund",
    title: "طلای آب‌شده، سکه یا صندوق طلا؟",
    description:
      "مقایسهٔ سه مسیر پرطرفدار سرمایه‌گذاری طلا از نظر هزینه، نقدشوندگی و پیچیدگی.",
    updatedAt: "2026-08-15",
    readMinutes: 7,
  },
];
