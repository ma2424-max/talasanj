import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CompareTable,
  DisclosureBanner,
  EmptyState,
  ScoreBadge,
} from "@/components";
import type { CompareRow } from "@/components/CompareTable";
import { getPlatformProfile } from "@/lib/data/platforms";
import { computeScore } from "@/lib/scoring";
import { getReferenceAmounts } from "@/lib/config";
import { formatPct, formatToman, toFaDigits } from "@/lib/format";

export const revalidate = 3600;

type PageProps = { params: Promise<{ pair: string }> };

function parsePair(pair: string): { a: string; b: string } | null {
  const idx = pair.indexOf("-vs-");
  if (idx <= 0) return null;
  const a = pair.slice(0, idx);
  const b = pair.slice(idx + 4);
  if (!a || !b || a === b) return null;
  return { a, b };
}

function numOrNull(v: string | null): number | null {
  return v !== null ? Number(v) : null;
}

/** برندهٔ ردیف فقط وقتی اختلاف معنادار است */
function betterByDiff(
  a: number | null,
  b: number | null,
  threshold: number,
  lowerIsBetter: boolean,
): "a" | "b" | null {
  if (a === null || b === null) return null;
  const diff = a - b;
  if (Math.abs(diff) < threshold) return null;
  if (lowerIsBetter) return diff < 0 ? "a" : "b";
  return diff > 0 ? "a" : "b";
}

function deliveryText(v: boolean | null): string {
  if (v === null) return "نامشخص";
  return v ? "دارد" : "ندارد";
}

async function loadPair(pair: string) {
  const parsed = parsePair(pair);
  if (!parsed) return null;
  const [pa, pb] = await Promise.all([
    getPlatformProfile(parsed.a),
    getPlatformProfile(parsed.b),
  ]);
  if (!pa || !pb) return null;
  return { pa, pb, slugs: parsed };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { pair } = await params;
  const loaded = await loadPair(pair);
  if (!loaded) return { title: "مقایسه پیدا نشد | طلاسنج" };
  const { pa, pb } = loaded;
  return {
    title: `${pa.platform.nameFa} در برابر ${pb.platform.nameFa} — کدام برای خرید طلا بهتر است؟ | طلاسنج`,
    description: `مقایسهٔ کامل ${pa.platform.nameFa} و ${pb.platform.nameFa}: کارمزد خرید و فروش، حداقل خرید، مجوز، تحویل فیزیکی، امتیاز طلاسنج و تجربهٔ کاربران.`,
    alternates: { canonical: "/compare/" + pair + "/" },
  };
}

export default async function ComparePage({ params }: PageProps) {
  const { pair } = await params;
  const loaded = await loadPair(pair);
  if (!loaded) notFound();

  const { pa, pb, slugs } = loaded;
  const A = pa.platform;
  const B = pb.platform;

  const scoreA = computeScore({
    fees: pa.feeRows,
    licenses: pa.licenseRows,
    review: {
      approvedCount: pa.approvedReviewCount,
      approvedAvg: pa.approvedReviewAvg,
    },
    platformStatus: A.status,
  });
  const scoreB = computeScore({
    fees: pb.feeRows,
    licenses: pb.licenseRows,
    review: {
      approvedCount: pb.approvedReviewCount,
      approvedAvg: pb.approvedReviewAvg,
    },
    platformStatus: B.status,
  });

  const feeA =
    pa.feeRows.find((f) => f.method === "molten-gold") ?? pa.feeRows[0];
  const feeB =
    pb.feeRows.find((f) => f.method === "molten-gold") ?? pb.feeRows[0];
  const buyA = numOrNull(feeA?.buyFeePct ?? null);
  const buyB = numOrNull(feeB?.buyFeePct ?? null);

  /* خلاصهٔ اتمی حکم — فقط از داده، نه سلیقه */
  let verdict: string;
  if (buyA === null && buyB === null) {
    verdict = `دادهٔ کارمزد هیچ‌کدام از این دو هنوز راستی‌آزمایی نشده است؛ حکم قطعی نمی‌دهیم. جدول زیر همان را نشان می‌دهد که الان با سند می‌دانیم.`;
  } else if (buyA === null || buyB === null) {
    const missing = buyA === null ? A.nameFa : B.nameFa;
    verdict = `کارمزد ${missing} هنوز راستی‌آزمایی نشده است؛ تا کامل‌شدن داده، حکم قطعی نمی‌دهیم و فقط دادهٔ سنددار را نشان می‌دهیم.`;
  } else if (buyA === buyB) {
    verdict = `از نظر کارمزد خرید، ${A.nameFa} و ${B.nameFa} برابرند (${formatPct(String(buyA))})؛ تصمیم را با مجوز، تحویل فیزیکی و امتیاز کلی بگیر.`;
  } else {
    const cheaper = buyA < buyB ? A.nameFa : B.nameFa;
    const diff = Math.abs(buyA - buyB);
    verdict = `برای بیشتر خریداران ${cheaper} به‌صرفه‌تر است: کارمزد خریدش ${formatPct(diff)} کمتر است؛ مگر اینکه تحویل فیزیکی یا حداقل خرید کمتر برایت مهم‌تر باشد — جدول زیر را ببین.`;
  }

  const licA = pa.licenseRows.some((l) => l.status === "verified");
  const licB = pb.licenseRows.some((l) => l.status === "verified");

  const rows: CompareRow[] = [
    {
      label: "امتیاز طلاسنج",
      a: (
        <ScoreBadge
          score={scoreA.total}
          incomplete={scoreA.incomplete}
          size="sm"
        />
      ),
      b: (
        <ScoreBadge
          score={scoreB.total}
          incomplete={scoreB.incomplete}
          size="sm"
        />
      ),
      better: betterByDiff(scoreA.total, scoreB.total, 5, false),
    },
    {
      label: "کارمزد خرید",
      a: formatPct(feeA?.buyFeePct ?? null),
      b: formatPct(feeB?.buyFeePct ?? null),
      better: betterByDiff(buyA, buyB, 0.001, true),
    },
    {
      label: "کارمزد فروش",
      a: formatPct(feeA?.sellFeePct ?? null),
      b: formatPct(feeB?.sellFeePct ?? null),
      better: betterByDiff(
        numOrNull(feeA?.sellFeePct ?? null),
        numOrNull(feeB?.sellFeePct ?? null),
        0.001,
        true,
      ),
    },
    {
      label: "حداقل خرید",
      a: feeA?.minBuyToman != null ? formatToman(feeA.minBuyToman) : "نامشخص",
      b: feeB?.minBuyToman != null ? formatToman(feeB.minBuyToman) : "نامشخص",
      better: betterByDiff(
        feeA?.minBuyToman ?? null,
        feeB?.minBuyToman ?? null,
        1,
        true,
      ),
    },
    {
      label: "تحویل فیزیکی",
      a: deliveryText(feeA?.physicalDelivery ?? null),
      b: deliveryText(feeB?.physicalDelivery ?? null),
      better:
        feeA?.physicalDelivery === true && feeB?.physicalDelivery !== true
          ? "a"
          : feeB?.physicalDelivery === true && feeA?.physicalDelivery !== true
            ? "b"
            : null,
    },
    {
      label: "مجوز راستی‌آزمایی‌شده",
      a: licA ? "دارد" : "ندارد",
      b: licB ? "دارد" : "ندارد",
      better: licA === licB ? null : licA ? "a" : "b",
    },
    {
      label: "نظرات تأییدشده",
      a: toFaDigits(pa.approvedReviewCount),
      b: toFaDigits(pb.approvedReviewCount),
      better: null,
    },
  ];

  /* هزینهٔ واقعی در مبالغ مرجع — فقط از کارمزد، بدون نیاز به قیمت لحظه‌ای */
  const amounts = getReferenceAmounts();
  const costRows =
    buyA !== null && buyB !== null
      ? amounts.map((amount) => {
          const feeCostA = Math.round((amount * buyA) / 100);
          const feeCostB = Math.round((amount * buyB) / 100);
          return {
            amount,
            feeCostA,
            feeCostB,
            cheaper:
              feeCostA === feeCostB ? null : feeCostA < feeCostB ? "a" : "b",
          };
        })
      : null;

  const forWhomA: string[] = [];
  const forWhomB: string[] = [];
  if (buyA !== null && buyB !== null && buyA !== buyB) {
    if (buyA < buyB)
      forWhomA.push("به هزینهٔ خرید حساسی و دنبال کمترین کارمزدی");
    else forWhomB.push("به هزینهٔ خرید حساسی و دنبال کمترین کارمزدی");
  }
  if (feeA?.minBuyToman != null && feeB?.minBuyToman != null) {
    if (feeA.minBuyToman < feeB.minBuyToman)
      forWhomA.push("می‌خواهی با مبالغ کوچک شروع کنی");
    else if (feeB.minBuyToman < feeA.minBuyToman)
      forWhomB.push("می‌خواهی با مبالغ کوچک شروع کنی");
  }
  if (feeA?.physicalDelivery === true)
    forWhomA.push("تحویل فیزیکی طلا برایت مهم است");
  if (feeB?.physicalDelivery === true)
    forWhomB.push("تحویل فیزیکی طلا برایت مهم است");

  const faqs = [
    {
      q: `کدام‌یک ارزان‌تر است: ${A.nameFa} یا ${B.nameFa}؟`,
      a:
        buyA === null || buyB === null
          ? "دادهٔ کارمزد یکی از این دو هنوز راستی‌آزمایی نشده است؛ پاسخ قطعی نمی‌دهیم."
          : buyA === buyB
            ? `کارمزد خرید هر دو برابر است (${formatPct(String(buyA))}).`
            : `${buyA < buyB ? A.nameFa : B.nameFa} کارمزد خرید کمتری دارد.`,
    },
    {
      q: "کدام‌یک معتبرتر است؟",
      a:
        licA === licB
          ? "از نظر وضعیت مجوز راستی‌آزمایی‌شده فعلاً یکسان‌اند؛ جزئیات را در بخش مجوزهای هر پروفایل ببین."
          : `${licA ? A.nameFa : B.nameFa} مجوز راستی‌آزمایی‌شده دارد و دیگری ندارد.`,
    },
    {
      q: "برای خرید با مبلغ کم کدام بهتر است؟",
      a:
        feeA?.minBuyToman != null && feeB?.minBuyToman != null
          ? feeA.minBuyToman === feeB.minBuyToman
            ? "حداقل خرید هر دو برابر است."
            : `${feeA.minBuyToman < feeB.minBuyToman ? A.nameFa : B.nameFa} حداقل خرید کمتری دارد.`
          : "حداقل خرید یکی از این دو نامشخص است؛ در حال راستی‌آزمایی هستیم.",
    },
    {
      q: "تحویل فیزیکی کدام دارد؟",
      a: `طبق داده‌های ثبت‌شده: ${A.nameFa} ${deliveryText(feeA?.physicalDelivery ?? null)} و ${B.nameFa} ${deliveryText(feeB?.physicalDelivery ?? null)}.`,
    },
  ];

  const related = [
    ...pa.siblings
      .filter((s) => s.slug !== slugs.b)
      .map((s) => ({
        href: `/compare/${slugs.a}-vs-${s.slug}/`,
        label: `${A.nameFa} در برابر ${s.nameFa}`,
      })),
    ...pb.siblings
      .filter((s) => s.slug !== slugs.a)
      .map((s) => ({
        href: `/compare/${slugs.b}-vs-${s.slug}/`,
        label: `${B.nameFa} در برابر ${s.nameFa}`,
      })),
  ].slice(0, 4);

  const pageUrl = "https://talasanj.org/compare/" + pair + "/";
  const jsonLdObjects: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: `${A.nameFa} در برابر ${B.nameFa}`,
      url: pageUrl,
      inLanguage: "fa",
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
          name: "پلتفرم‌ها",
          item: "https://talasanj.org/platforms/",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: `${A.nameFa} در برابر ${B.nameFa}`,
          item: pageUrl,
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
    <main className="mx-auto flex max-w-4xl flex-col gap-10 px-6 py-10">
      <nav aria-label="breadcrumb" className="text-xs text-muted">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="hover:text-gold">
              خانه
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li>
            <Link href="/platforms/" className="hover:text-gold">
              پلتفرم‌ها
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li className="text-muted">مقایسه</li>
          <li aria-hidden>›</li>
          <li aria-current="page" className="text-cream">
            {A.nameFa} در برابر {B.nameFa}
          </li>
        </ol>
      </nav>

      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">
          {A.nameFa} در برابر {B.nameFa}
        </h1>
        <p className="measure rounded-2xl bg-bg-surface p-5 leading-8">
          {verdict}
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">جدول کنارهم</h2>
        <CompareTable nameA={A.nameFa} nameB={B.nameFa} rows={rows} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">هزینهٔ خرید در مبالغ مختلف</h2>
        {costRows ? (
          <div className="overflow-x-auto rounded-2xl border border-muted/20">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead className="bg-bg-surface text-xs text-muted">
                <tr>
                  <th className="px-4 py-3 text-start font-medium">
                    مبلغ خرید
                  </th>
                  <th className="px-4 py-3 text-start font-medium">
                    کارمزد در {A.nameFa}
                  </th>
                  <th className="px-4 py-3 text-start font-medium">
                    کارمزد در {B.nameFa}
                  </th>
                  <th className="px-4 py-3 text-start font-medium">ارزان‌تر</th>
                </tr>
              </thead>
              <tbody>
                {costRows.map((r) => (
                  <tr key={r.amount} className="border-t border-muted/10">
                    <td className="tnum px-4 py-3">{formatToman(r.amount)}</td>
                    <td
                      className={`tnum px-4 py-3 ${r.cheaper === "a" ? "bg-positive/10 font-bold" : ""}`}
                    >
                      {formatToman(r.feeCostA)}
                    </td>
                    <td
                      className={`tnum px-4 py-3 ${r.cheaper === "b" ? "bg-positive/10 font-bold" : ""}`}
                    >
                      {formatToman(r.feeCostB)}
                    </td>
                    <td className="px-4 py-3">
                      {r.cheaper === "a"
                        ? A.nameFa
                        : r.cheaper === "b"
                          ? B.nameFa
                          : "برابر"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="دادهٔ کافی برای مقایسهٔ هزینه نیست"
            body="کارمزد حداقل یکی از این دو پلتفرم هنوز راستی‌آزمایی نشده است."
          />
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">تفکیک شش محور امتیاز</h2>
        <div className="flex flex-col gap-4">
          {scoreA.axes.map((axis, i) => {
            const axisB = scoreB.axes[i];
            return (
              <div key={axis.key} className="rounded-xl bg-bg-surface p-4">
                <div className="flex items-center justify-between text-sm">
                  <span>{axis.label}</span>
                  <span className="text-muted">
                    وزن {toFaDigits(axis.weight)}٪
                  </span>
                </div>
                <div className="mt-2 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="w-24 shrink-0 text-xs text-muted">
                      {A.nameFa}
                    </span>
                    <div className="h-2 w-full rounded-full bg-bg-base">
                      <div
                        className="h-2 rounded-full bg-gold"
                        style={{
                          width:
                            axis.ratio === null
                              ? "0%"
                              : `${Math.round(axis.ratio * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="tnum w-10 text-xs text-muted">
                      {axis.ratio === null
                        ? "نامشخص"
                        : `${toFaDigits(Math.round(axis.ratio * 100))}٪`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-24 shrink-0 text-xs text-muted">
                      {B.nameFa}
                    </span>
                    <div className="h-2 w-full rounded-full bg-bg-base">
                      <div
                        className="h-2 rounded-full bg-cream/60"
                        style={{
                          width:
                            axisB.ratio === null
                              ? "0%"
                              : `${Math.round(axisB.ratio * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="tnum w-10 text-xs text-muted">
                      {axisB.ratio === null
                        ? "نامشخص"
                        : `${toFaDigits(Math.round(axisB.ratio * 100))}٪`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-gold/20 bg-bg-surface p-5">
          <h2 className="font-bold text-gold">
            {A.nameFa} برای چه کسی بهتر است
          </h2>
          {forWhomA.length > 0 ? (
            <ul className="mt-2 flex list-disc flex-col gap-1 pe-5 text-sm leading-7 text-cream/80">
              {forWhomA.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm leading-7 text-muted">
              تفاوت معناداری در داده‌ها نمی‌بینیم؛ پروفایل کاملش را بخوان.
            </p>
          )}
        </div>
        <div className="rounded-2xl border border-cream/20 bg-bg-surface p-5">
          <h2 className="font-bold">{B.nameFa} برای چه کسی بهتر است</h2>
          {forWhomB.length > 0 ? (
            <ul className="mt-2 flex list-disc flex-col gap-1 pe-5 text-sm leading-7 text-cream/80">
              {forWhomB.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm leading-7 text-muted">
              تفاوت معناداری در داده‌ها نمی‌بینیم؛ پروفایل کاملش را بخوان.
            </p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">تجربهٔ کاربران</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              name: A.nameFa,
              count: pa.approvedReviewCount,
              avg: pa.approvedReviewAvg,
            },
            {
              name: B.nameFa,
              count: pb.approvedReviewCount,
              avg: pb.approvedReviewAvg,
            },
          ].map((r) => (
            <div key={r.name} className="rounded-xl bg-bg-surface p-4 text-sm">
              <p className="font-bold">{r.name}</p>
              <p className="mt-1 text-muted">
                {r.count >= 5 && r.avg !== null
                  ? `${toFaDigits(r.count)} نظر تأییدشده با میانگین ${toFaDigits(r.avg.toFixed(1).replace(".", "٫"))} از ۵`
                  : "به حد نصاب نظرات نرسیده (حداقل ۵ نظر تأییدشده)"}
              </p>
            </div>
          ))}
        </div>
      </section>

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

      <section className="grid gap-3 sm:grid-cols-2">
        {[A, B].map((p) => (
          <div
            key={p.slug}
            className="flex flex-col gap-3 rounded-2xl border border-gold/30 bg-bg-surface p-5"
          >
            <p className="font-bold">{p.nameFa}</p>
            <div className="flex flex-wrap gap-2">
              <a
                href={`/go/${p.slug}`}
                rel="nofollow"
                className="rounded-xl bg-gold px-4 py-2 text-sm font-bold text-bg-base"
              >
                ورود به سایت {p.nameFa}
              </a>
              <Link
                href={`/platforms/${p.slug}/`}
                className="rounded-xl border border-muted/30 px-4 py-2 text-sm hover:border-gold"
              >
                پروفایل کامل
              </Link>
            </div>
          </div>
        ))}
      </section>

      {related.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">مقایسه‌های مرتبط</h2>
          <ul className="flex flex-wrap gap-2">
            {related.map((r) => (
              <li key={r.href}>
                <Link
                  href={r.href}
                  className="rounded-xl bg-bg-surface px-4 py-2 text-sm transition-colors hover:text-gold"
                >
                  {r.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <DisclosureBanner variant="general" />

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
