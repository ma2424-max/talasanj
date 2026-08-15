import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ابزارهای طلا — هزینه، حباب، اجرت و سر‌به‌سر | طلاسنج",
  description: "شش ابزار رایگان و شفاف طلاسنج برای بازکردن هزینه‌های خرید طلا.",
  alternates: { canonical: "/tools/" },
};

const TOOLS = [
  [
    "/tools/real-cost/",
    "محاسبه‌گر هزینهٔ واقعی",
    "مقدار طلای دریافتی پس از کسر کارمزد را ببین.",
  ],
  [
    "/tools/method-compare/",
    "مقایسه‌گر روش‌ها",
    "هفت روش خرید طلا را با معیارهای یکسان مقایسه کن.",
  ],
  [
    "/tools/coin-bubble/",
    "حباب‌سنج سکه",
    "اختلاف قیمت بازار و ارزش ذاتی را حساب کن.",
  ],
  [
    "/tools/savings-plan/",
    "محاسبه‌گر پس‌انداز طلا",
    "اثر مبلغ ماهانه و کارمزد را در سناریوی قیمت ثابت ببین.",
  ],
  [
    "/tools/ejrat/",
    "محاسبه‌گر اجرت، سود و مالیات",
    "قیمت طلای زینتی را به اجزایش تفکیک کن.",
  ],
  [
    "/tools/break-even/",
    "نقطهٔ سر‌به‌سر خرید",
    "درصد رشد لازم برای جبران کارمزدها را حساب کن.",
  ],
] as const;

export default function ToolsPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10">
      <nav aria-label="breadcrumb" className="text-xs text-muted">
        <ol className="flex gap-1">
          <li>
            <Link href="/">خانه</Link>
          </li>
          <li aria-hidden>›</li>
          <li aria-current="page">ابزارها</li>
        </ol>
      </nav>
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">ابزارهای طلا</h1>
        <p className="measure rounded-2xl bg-bg-surface p-5 leading-8">
          فرمول، فرض‌ها و محدودیت‌ها در هر ابزار باز است و هیچ خروجی توصیهٔ
          سرمایه‌گذاری نیست.
        </p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {TOOLS.map(([href, name, desc]) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col gap-2 rounded-2xl border border-gold/30 bg-bg-surface p-5 hover:border-gold"
          >
            <p className="font-bold">{name}</p>
            <p className="text-sm leading-7 text-cream/70">{desc}</p>
            <span className="text-xs font-bold text-gold">باز کن ←</span>
          </Link>
        ))}
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "ابزارهای طلا",
            itemListElement: TOOLS.map(([href, name], index) => ({
              "@type": "ListItem",
              position: index + 1,
              name,
              url: "https://talasanj.org" + href,
            })),
          }).replace(/</g, "\\u003c"),
        }}
      />
    </main>
  );
}
