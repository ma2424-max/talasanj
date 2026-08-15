import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState, RiskFlag, ToolPanel } from "@/components";
import { RealCostForm } from "@/components/RealCostForm";
import { rankPlatforms, type RankedPlatform } from "@/lib/calc/real-cost";
import { getVatRatePct, VAT_NOTE } from "@/lib/config";
import { listPlatformFeesForMethod } from "@/lib/data/platforms";
import { formatGrams, formatPct, formatToman, toFaDigits } from "@/lib/format";

export const revalidate = 3600;

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const hasQuery = Object.keys(sp).length > 0;
  return {
    title: "محاسبه‌گر هزینهٔ واقعی خرید طلا | طلاسنج",
    description:
      "ببین برای مبلغ تو، پس از کسر کارمزد و مالیات، دقیقاً چقدر طلا می‌گیری؛ پلتفرم‌ها بر اساس هزینهٔ واقعی رتبه‌بندی می‌شوند.",
    /* نتایج پارامتردار noindex و canonical به نسخهٔ تمیز — §۸.۳ سند ساختار */
    alternates: { canonical: "/tools/real-cost/" },
    robots: hasQuery ? { index: false, follow: true } : undefined,
  };
}

export default async function RealCostToolPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const amountRaw = firstParam(sp.amount);
  const priceRaw = firstParam(sp.price);
  const amountToman = Number(amountRaw);
  const goldPrice = Number(priceRaw);
  const hasQuery = amountRaw !== undefined || priceRaw !== undefined;
  const hasValidInput =
    Number.isFinite(amountToman) &&
    amountToman > 0 &&
    Number.isFinite(goldPrice) &&
    goldPrice > 0;

  const vatRatePct = getVatRatePct();

  let ranked: RankedPlatform[] = [];
  let unknown: { slug: string; nameFa: string }[] = [];
  if (hasValidInput) {
    const items = await listPlatformFeesForMethod("molten-gold");
    ({ ranked, unknown } = rankPlatforms(
      items.map((i) => ({
        slug: i.slug,
        nameFa: i.nameFa,
        buyFeePct: i.fee?.buyFeePct != null ? Number(i.fee.buyFeePct) : null,
      })),
      amountToman,
      goldPrice,
      vatRatePct,
    ));
  }

  const faqs = [
    {
      q: "هزینهٔ واقعی خرید طلا چطور محاسبه می‌شود؟",
      a: "مبلغ خالص تبدیل به طلا = مبلغ ورودی منهای کارمزد خرید و مالیات بر کارمزد. سپس مبلغ خالص بر قیمت مرجع هر گرم تقسیم می‌شود تا معادل طلا به دست بیاید.",
    },
    {
      q: "چرا مالیات فقط روی کارمزد حساب می‌شود؟",
      a: "طبق قاعدهٔ فعلی، اصل طلا از مالیات ارزش افزوده معاف است و مالیات فقط به اجرت، سود فروشنده و حق‌العمل تعلق می‌گیرد. نرخ دقیق از فایل پیکربندی طلاسنج خوانده می‌شود و تا تأیید رسمی آن، محاسبه بدون مالیات و با هشدار انجام می‌شود.",
    },
    {
      q: "چرا یک پلتفرم در فهرست رتبه‌بندی نیست؟",
      a: "پلتفرم‌هایی که کارمزدشان هنوز با منبع معتبر راستی‌آزمایی نشده، به بخش «بدون دادهٔ کارمزد» می‌روند؛ طلاسنج هیچ عددی را حدس نمی‌زند.",
    },
  ];

  const jsonLdObjects: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "محاسبه‌گر هزینهٔ واقعی خرید طلا",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      inLanguage: "fa",
      url: "https://talasanj.org/tools/real-cost/",
      offers: { "@type": "Offer", price: "0", priceCurrency: "IRR" },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "خانه",
          item: "https://talasanj.org/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "ابزارها",
          item: "https://talasanj.org/tools/",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "محاسبه‌گر هزینهٔ واقعی",
          item: "https://talasanj.org/tools/real-cost/",
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

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
          <li>
            <Link href="/tools/" className="hover:text-gold">
              ابزارها
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li aria-current="page" className="text-cream">
            محاسبه‌گر هزینهٔ واقعی
          </li>
        </ol>
      </nav>

      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">محاسبه‌گر هزینهٔ واقعی خرید طلا</h1>
        <p className="measure rounded-2xl bg-bg-surface p-5 leading-8">
          مبلغ و قیمت مرجع را وارد کن تا ببینی پس از کسر کارمزد و مالیات، دقیقاً
          چقدر طلا می‌گیری و کدام پلتفرم برای تو ارزان‌تر است.
        </p>
      </header>

      <ToolPanel
        title="ورودی محاسبه"
        howItWorks={
          <>
            <p>
              فرمول: مبلغ خالص طلا = مبلغ ورودی − کارمزد خرید − مالیات بر
              کارمزد. سپس معادل طلا = مبلغ خالص ÷ قیمت مرجع هر گرم.
            </p>
            <p className="mt-2">
              نرخ مالیات از فایل پیکربندی طلاسنج (assumptions.json) خوانده
              می‌شود و وضعیت فعلی آن:{" "}
              {vatRatePct === null
                ? "هنوز تأیید نشده — محاسبه بدون مالیات انجام می‌شود."
                : `${toFaDigits(vatRatePct)}٪`}
            </p>
            <p className="mt-2 text-xs text-muted">{VAT_NOTE}</p>
          </>
        }
      >
        <RealCostForm amount={amountRaw} price={priceRaw} />
      </ToolPanel>

      {hasQuery && !hasValidInput ? (
        <RiskFlag
          severity="warning"
          title="ورودی نامعتبر است"
          body="مبلغ و قیمت مرجع باید عددی و بزرگ‌تر از صفر باشند."
        />
      ) : null}

      {!hasQuery ? (
        <EmptyState
          title="مبلغ را وارد کن تا نتیجه ببینی"
          body="مثلاً ۵۰٬۰۰۰٬۰۰۰ تومان و قیمت مرجع امروز هر گرم طلای ۱۸ عیار."
        />
      ) : null}

      {hasValidInput ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">
            نتیجه برای {formatToman(amountToman)} با قیمت مرجع{" "}
            {formatToman(goldPrice)}
          </h2>

          {vatRatePct === null ? (
            <RiskFlag
              severity="info"
              title="مالیات در این محاسبه لحاظ نشده"
              body="نرخ مالیات ارزش افزوده هنوز از مرجع رسمی تأیید نشده است؛ طبق قاعدهٔ شفافیت، محاسبه بدون مالیات انجام شد و با تأیید نرخ به‌روز می‌شود."
            />
          ) : null}

          {ranked.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-muted/20">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <caption className="sr-only">
                  رتبه‌بندی پلتفرم‌ها بر اساس هزینهٔ واقعی
                </caption>
                <thead className="bg-bg-surface text-xs text-muted">
                  <tr>
                    <th className="px-4 py-3 text-start font-medium">رتبه</th>
                    <th className="px-4 py-3 text-start font-medium">پلتفرم</th>
                    <th className="px-4 py-3 text-start font-medium">
                      کارمزد خرید
                    </th>
                    <th className="px-4 py-3 text-start font-medium">
                      مبلغ خالص طلا
                    </th>
                    <th className="px-4 py-3 text-start font-medium">
                      معادل تقریبی
                    </th>
                    <th className="px-4 py-3 text-start font-medium">
                      هزینهٔ مؤثر
                    </th>
                    <th className="px-4 py-3 text-start font-medium">
                      پروفایل
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((r, i) => (
                    <tr
                      key={r.slug}
                      className={`border-t border-muted/10 ${
                        i === 0 ? "bg-gold/5" : ""
                      }`}
                    >
                      <td className="tnum px-4 py-3 font-bold text-gold">
                        {toFaDigits(i + 1)}
                      </td>
                      <th className="px-4 py-3 text-start font-medium">
                        {r.nameFa}
                      </th>
                      <td className="tnum px-4 py-3">
                        {formatPct(
                          String(
                            r.feeToman > 0
                              ? (r.feeToman / amountToman) * 100
                              : 0,
                          ),
                        )}
                      </td>
                      <td className="tnum px-4 py-3">
                        {formatToman(r.netGoldToman)}
                      </td>
                      <td className="tnum px-4 py-3 font-bold">
                        {formatGrams(r.goldGrams)}
                      </td>
                      <td className="tnum px-4 py-3">
                        {toFaDigits(
                          r.effectiveFeePct.toFixed(2).replace(".", "٫"),
                        )}
                        ٪
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/platforms/${r.slug}/`}
                          className="text-sm text-gold underline decoration-dotted underline-offset-4"
                        >
                          پروفایل
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="هنوز پلتفرمی با کارمزد راستی‌آزمایی‌شده نداریم"
              body="به محض تکمیل داده، رتبه‌بندی اینجا می‌آید."
            />
          )}

          {unknown.length > 0 ? (
            <p className="text-xs leading-6 text-muted">
              بدون دادهٔ کارمزد و خارج از رتبه‌بندی:{" "}
              {unknown.map((u) => u.nameFa).join("، ")}. طلاسنج هیچ عددی را حدس
              نمی‌زند؛ این پلتفرم‌ها در حال راستی‌آزمایی هستند.
            </p>
          ) : null}
        </section>
      ) : null}

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-bold">پرسش‌های متداول</h2>
        {faqs.map((f) => (
          <details key={f.q} className="rounded-xl bg-bg-surface p-4">
            <summary className="cursor-pointer font-bold">{f.q}</summary>
            <p className="measure mt-2 text-sm leading-8 text-cream/80">
              {f.a}
            </p>
          </details>
        ))}
      </section>

      {jsonLdObjects.map((obj, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(obj).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </main>
  );
}
