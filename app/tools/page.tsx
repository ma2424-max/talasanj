import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ابزارهای طلا — محاسبه‌گر هزینه، حباب و پس‌انداز | طلاسنج",
  description:
    "زرادخانهٔ محاسباتی طلاسنج: محاسبه‌گر هزینهٔ واقعی خرید طلا و به‌زودی مقایسه‌گر روش‌ها، حباب‌سنج و ابزارهای دیگر.",
  alternates: { canonical: "/tools/" },
};

const TOOLS = [
  {
    href: "/tools/real-cost/",
    name: "محاسبه‌گر هزینهٔ واقعی",
    desc: "ببین برای مبلغ تو، پس از کسر کارمزد و مالیات، دقیقاً چقدر طلا می‌گیری و کدام پلتفرم ارزان‌تر است.",
    ready: true,
  },
  {
    href: null,
    name: "مقایسه‌گر روش‌ها",
    desc: "هزینهٔ ۷ روش خرید طلا را کنار هم ببین.",
    ready: false,
  },
  {
    href: null,
    name: "حباب‌سنج سکه و طلا",
    desc: "ببین قیمت سکه نسبت به ارزش ذاتی‌اش چقدر حباب دارد.",
    ready: false,
  },
  {
    href: null,
    name: "طرح پس‌انداز طلا",
    desc: "برای پس‌انداز ماهانه‌ات بهترین مسیر را پیدا کن.",
    ready: false,
  },
  {
    href: null,
    name: "محاسبه‌گر اجرت، سود و مالیات",
    desc: "قیمت نهایی طلای زینتی را با تفکیک اجرت و مالیات ببین.",
    ready: false,
  },
  {
    href: null,
    name: "نقطهٔ سر‌به‌سر خرید",
    desc: "ببین طلا چند درصد رشد کند تا خریدت به سود برسد.",
    ready: false,
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "ابزارهای طلا",
  url: "https://talasanj.org/tools/",
};

export default function ToolsHubPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10">
      <nav aria-label="breadcrumb" className="text-xs text-muted">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="hover:text-gold">
              خانه
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li aria-current="page" className="text-cream">
            ابزارها
          </li>
        </ol>
      </nav>

      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">ابزارهای طلا</h1>
        <p className="measure rounded-2xl bg-bg-surface p-5 leading-8">
          ابزارهای رایگان طلاسنج برای تصمیم‌گیری بهتر خرید طلا. همهٔ محاسبات با
          فرمول باز و منابع مشخص انجام می‌شود و باکس «چطور محاسبه شد؟» در هر
          ابزار همیشه باز است.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {TOOLS.map((tool) =>
          tool.ready && tool.href ? (
            <Link
              key={tool.name}
              href={tool.href}
              className="flex flex-col gap-2 rounded-2xl border border-gold/30 bg-bg-surface p-5 transition-colors hover:border-gold"
            >
              <p className="font-bold">{tool.name}</p>
              <p className="text-sm leading-7 text-cream/70">{tool.desc}</p>
              <span className="text-xs font-bold text-gold">باز کن ←</span>
            </Link>
          ) : (
            <div
              key={tool.name}
              className="flex flex-col gap-2 rounded-2xl border border-muted/20 bg-bg-surface p-5 opacity-70"
            >
              <p className="font-bold">
                {tool.name}{" "}
                <span className="rounded-full border border-muted/30 px-2 py-0.5 text-[0.7rem] text-muted">
                  در راه است
                </span>
              </p>
              <p className="text-sm leading-7 text-cream/70">{tool.desc}</p>
            </div>
          ),
        )}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </main>
  );
}
