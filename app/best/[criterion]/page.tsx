import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DataFreshnessBadge, EmptyState, ScoreBadge } from "@/components";
import { listDirectoryEntries } from "@/lib/data/platforms";
import {
  RANKERS,
  type BestCriterion,
  type RankableEntry,
} from "@/lib/rankings";
import { formatFaDate, formatPct, formatToman, toFaDigits } from "@/lib/format";

export const revalidate = 3600;

type MetricKey =
  "buyFee" | "delivery" | "minBuy" | "license" | "settlement" | "score";

type CriterionMeta = {
  h1: string;
  title: string;
  description: string;
  method: string;
  notFor: string;
  metric: MetricKey;
  metricLabel: string;
};

/** شش معیار پرتاب — §۵.۲ سند ساختار */
const CRITERIA_META: Record<string, CriterionMeta> = {
  "lowest-fee": {
    h1: "پلتفرم‌های طلا با کمترین کارمزد",
    title: "پلتفرم‌های طلا با کمترین کارمزد | طلاسنج",
    description:
      "رتبه‌بندی پلتفرم‌های خرید طلا بر اساس کمترین کارمزد خریدِ راستی‌آزمایی‌شده؛ شفاف، خودکار و بدون تبلیغ.",
    method:
      "معیار: کمترین کارمزد خرید با منبع معتبر (اعلامی رسمی یا مشاهده‌شده). پلتفرم بدون دادهٔ کارمزد در فهرست نیست. رتبه‌بندی تمام‌خودکار از دیتابیس است و به‌روزرسانی ماهانه دارد.",
    notFor:
      "اگر تحویل فیزیکی یا شروع با مبالغ خیلی کم برایت مهم‌تر از کارمزد است، این لیست معیار درستی نیست — صفحه‌های «دارای تحویل فیزیکی» یا «خرید جزئی» را ببین.",
    metric: "buyFee",
    metricLabel: "کارمزد خرید",
  },
  "physical-delivery": {
    h1: "پلتفرم‌های دارای تحویل فیزیکی طلا",
    title: "پلتفرم‌های دارای تحویل فیزیکی طلا | طلاسنج",
    description:
      "کدام پلتفرم‌های طلا تحویل فیزیکی دارند؟ فهرست راستی‌آزمایی‌شده با امتیاز تسویه و تحویل.",
    method:
      "معیار: داشتن تحویل فیزیکی (دادهٔ سنددار) و بعد امتیاز محور تسویه و تحویل از موتور امتیازدهی. پلتفرم‌های با وضعیت نامشخص در فهرست نیستند.",
    notFor:
      "اگر فقط سرمایه‌گذاری کاغذی می‌کنی و تحویل فیزیکی نمی‌خواهی، این لیست کمکت نمی‌کند.",
    metric: "delivery",
    metricLabel: "تحویل فیزیکی",
  },
  "small-savings": {
    h1: "بهترین پلتفرم‌ها برای خرید جزئی و پس‌انداز طلا",
    title: "بهترین پلتفرم‌ها برای خرید جزئی و پس‌انداز طلا | طلاسنج",
    description:
      "برای شروع با مبالغ کم: پلتفرم‌ها بر اساس حداقل مبلغ خرید و کارمزد در مبلغ مرجع ۵۰۰ هزار تومان.",
    method:
      "معیار: کمترین حداقل خرید؛ در مساوی بودن، کمترین کارمزد خرید. مبلغ مرجع ارزیابی ۵۰۰ هزار تومان است.",
    notFor:
      "اگر با مبالغ بزرگ خرید می‌کنی، حداقل خرید برایت مهم نیست — لیست «کمترین کارمزد» را ببین.",
    metric: "minBuy",
    metricLabel: "حداقل خرید",
  },
  licensed: {
    h1: "پلتفرم‌های دارای مجوز رسمی",
    title: "پلتفرم‌های دارای مجوز رسمی | طلاسنج",
    description:
      "پلتفرم‌هایی که مجوزشان از مراجع رسمی راستی‌آزمایی شده است؛ مرتب بر اساس امتیاز طلاسنج.",
    method:
      "معیار: داشتن حداقل یک مجوز راستی‌آزمایی‌شده از مراجع رسمی؛ ترتیب بر اساس امتیاز طلاسنج. طلاسنج هیچ پلتفرمی را «تأیید» نمی‌کند؛ فقط نتیجهٔ راستی‌آزمایی مدارک را گزارش می‌دهد.",
    notFor:
      "اگر معیار اصلی‌ات هزینه است، مجوز به‌تنهایی کافی نیست — لیست «کمترین کارمزد» را هم ببین.",
    metric: "license",
    metricLabel: "وضعیت مجوز",
  },
  "fastest-settlement": {
    h1: "پلتفرم‌های طلا با سریع‌ترین تسویه و برداشت",
    title: "پلتفرم‌های طلا با سریع‌ترین تسویه و برداشت | طلاسنج",
    description:
      "پلتفرم‌ها بر اساس دادهٔ تسویه و تحویل؛ با تکمیل مدل دادهٔ تسویه، زمان دقیق هر پلتفرم اینجا می‌آید.",
    method:
      "معیار فعلی: سیگنال‌های تسویه (اطلاعات برداشت و تحویل فیزیکی) و امتیاز محور تسویه و تحویل. با اتصال دادهٔ مشاهده‌شدهٔ زمان تسویه، معیار دقیق‌تر می‌شود و همین‌جا مستند می‌شود.",
    notFor:
      "اگر قصد نگهداری بلندمدت داری و برداشت سریع برایت مهم نیست، معیار کارمزد مهم‌تر است.",
    metric: "settlement",
    metricLabel: "امتیاز تسویه و تحویل",
  },
  "gold-bar": {
    h1: "بهترین پلتفرم‌ها برای خرید شمش طلا",
    title: "بهترین پلتفرم‌ها برای خرید شمش طلا | طلاسنج",
    description:
      "پلتفرم‌های ارائه‌دهندهٔ شمش طلا، مرتب‌شده بر اساس امتیاز طلاسنج.",
    method:
      "معیار: ارائهٔ شمش طلا (بر اساس روش‌های ثبت‌شدهٔ پلتفرم) و بعد امتیاز طلاسنج.",
    notFor: "اگر طلای آب‌شده با حداقل مبلغ کم می‌خواهی، این لیست برایت نیست.",
    metric: "score",
    metricLabel: "امتیاز طلاسنج",
  },
};

type PageProps = { params: Promise<{ criterion: string }> };

function toRankable(
  entries: Awaited<ReturnType<typeof listDirectoryEntries>>,
): RankableEntry[] {
  return entries.map((e) => ({
    slug: e.platform.slug,
    nameFa: e.platform.nameFa,
    status: e.platform.status,
    methods: e.platform.methods,
    buyFeePct:
      e.primaryFee?.buyFeePct != null ? Number(e.primaryFee.buyFeePct) : null,
    sellFeePct:
      e.primaryFee?.sellFeePct != null ? Number(e.primaryFee.sellFeePct) : null,
    minBuyToman: e.primaryFee?.minBuyToman ?? null,
    physicalDelivery: e.primaryFee?.physicalDelivery ?? null,
    withdrawalFeeToman: e.primaryFee?.withdrawalFeeToman ?? null,
    hasVerifiedLicense: e.licenses.some((l) => l.status === "verified"),
    scoreTotal: e.score.total,
    settlementRatio:
      e.score.axes.find((a) => a.key === "settlement")?.ratio ?? null,
    latestDataAt: e.latestDataAt,
  }));
}

/** نقطهٔ ضعف صادقانه و داده‌محور — هر آیتم لیست باید یکی داشته باشد */
function weaknessOf(e: RankableEntry): string {
  if (e.scoreTotal === null) return "دادهٔ کافی برای امتیاز کامل ندارد";
  if (!e.hasVerifiedLicense) return "هنوز مجوز راستی‌آزمایی‌شده ندارد";
  if (e.physicalDelivery !== true) return "تحویل فیزیکی ندارد یا نامشخص است";
  if (e.latestDataAt === null) return "تاریخ به‌روزرسانی دادهٔ آن نامشخص است";
  return "پوشش دادهٔ آن هنوز کامل نیست و در حال تکمیل است";
}

function metricCell(e: RankableEntry, metric: MetricKey) {
  switch (metric) {
    case "buyFee":
      return <span className="tnum">{formatPct(e.buyFeePct)}</span>;
    case "delivery":
      return <span className="text-positive">دارد</span>;
    case "minBuy":
      return (
        <span className="tnum">
          {e.minBuyToman !== null ? formatToman(e.minBuyToman) : "نامشخص"}
        </span>
      );
    case "license":
      return <span className="text-positive">راستی‌آزمایی‌شده</span>;
    case "settlement":
      return (
        <span className="tnum">
          {e.settlementRatio !== null
            ? `${toFaDigits(Math.round(e.settlementRatio * 100))}٪`
            : "نامشخص"}
        </span>
      );
    case "score":
      return <ScoreBadge score={e.scoreTotal} size="sm" />;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { criterion } = await params;
  const meta = CRITERIA_META[criterion];
  if (!meta) return { title: "برترین‌ها | طلاسنج" };
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: "/best/" + criterion + "/" },
  };
}

export default async function BestPage({ params }: PageProps) {
  const { criterion } = await params;
  const meta = CRITERIA_META[criterion];
  const ranker = RANKERS[criterion as BestCriterion];
  if (!meta || !ranker) notFound();

  const entries = await listDirectoryEntries();
  const ranked = ranker(toRankable(entries)).slice(0, 10);

  const latest =
    ranked
      .map((r) => r.latestDataAt)
      .filter((d): d is string => d !== null)
      .sort()
      .at(-1) ?? null;

  const atomicIntro =
    ranked.length > 0
      ? `در این فهرست ${toFaDigits(ranked.length)} پلتفرم بر اساس معیار «${meta.h1}» رتبه‌بندی شده‌اند و صدر با ${ranked[0].nameFa} است. رتبه‌بندی تمام‌خودکار از دیتابیس طلاسنج است${latest ? ` و تازه‌ترین دادهٔ آن ${formatFaDate(latest)} است` : ""}.`
      : `فعلاً هیچ پلتفرمی دادهٔ کافی برای این معیار را ندارد؛ به محض عبور از دروازهٔ داده، فهرست خودکار پر می‌شود.`;

  const faqs = [
    {
      q: "این رتبه‌بندی چطور ساخته می‌شود؟",
      a: "کاملاً خودکار و از روی دادهٔ دیتابیس: معیار دقیقش در باکس «روش رتبه‌بندی» همین صفحه باز نوشته شده و هیچ‌کس نمی‌تواند رتبه بخرد.",
    },
    {
      q: "آیا پلتفرم‌ها می‌توانند جایگاه بخرند؟",
      a: "خیر. دیوار بین تحریریه و تبلیغات در طلاسنج محکم است؛ جزئیات در صفحهٔ افشای تبلیغات و درآمد.",
    },
    {
      q: "این لیست کی به‌روز می‌شود؟",
      a: "ماهانه و با هر تغییر مهم داده؛ تاریخ تازه‌ترین داده روی خود صفحه دیده می‌شود.",
    },
  ];

  const pageUrl = "https://talasanj.org/best/" + criterion + "/";
  const jsonLdObjects: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: meta.h1,
      url: pageUrl,
      itemListElement: ranked.map((e, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: e.nameFa,
        url: "https://talasanj.org/platforms/" + e.slug + "/",
      })),
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
        { "@type": "ListItem", position: 2, name: meta.h1, item: pageUrl },
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
          <li aria-current="page" className="text-cream">
            {meta.h1}
          </li>
        </ol>
      </nav>

      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">{meta.h1}</h1>
        <p className="measure rounded-2xl bg-bg-surface p-5 leading-8">
          {atomicIntro}
        </p>
      </header>

      <details
        open
        className="rounded-xl border border-gold/30 bg-bg-surface p-4"
      >
        <summary className="cursor-pointer font-bold text-gold">
          روش رتبه‌بندی این لیست
        </summary>
        <p className="measure mt-2 text-sm leading-8 text-cream/80">
          {meta.method}
        </p>
      </details>

      {ranked.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-muted/20">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead className="bg-bg-surface text-xs text-muted">
              <tr>
                <th className="px-4 py-3 text-start font-medium">رتبه</th>
                <th className="px-4 py-3 text-start font-medium">پلتفرم</th>
                <th className="px-4 py-3 text-start font-medium">
                  {meta.metricLabel}
                </th>
                <th className="px-4 py-3 text-start font-medium">امتیاز</th>
                <th className="px-4 py-3 text-start font-medium">تازگی</th>
                <th className="px-4 py-3 text-start font-medium">پروفایل</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((e, i) => (
                <tr key={e.slug} className="border-t border-muted/10">
                  <td className="tnum px-4 py-3 font-bold text-gold">
                    {toFaDigits(i + 1)}
                  </td>
                  <th className="px-4 py-3 text-start font-medium">
                    {e.nameFa}
                  </th>
                  <td className="px-4 py-3">{metricCell(e, meta.metric)}</td>
                  <td className="px-4 py-3">
                    <ScoreBadge score={e.scoreTotal} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    {e.latestDataAt ? (
                      <DataFreshnessBadge date={e.latestDataAt} />
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/platforms/${e.slug}/`}
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
          title="فعلاً گزینه‌ای برای این معیار نداریم"
          body="پلتفرم‌ها باید اول از دروازهٔ داده بگذرند؛ به محض کافی‌شدن داده، فهرست خودکار پر می‌شود."
        />
      )}

      {ranked.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">نگاه نزدیک به سه‌تای اول</h2>
          {ranked.slice(0, 3).map((e, i) => (
            <div
              key={e.slug}
              className="flex flex-col gap-2 rounded-2xl bg-bg-surface p-5"
            >
              <p className="font-bold">
                {toFaDigits(i + 1)}. {e.nameFa}
              </p>
              <p className="measure text-sm leading-7 text-cream/80">
                {meta.metricLabel}: {metricCell(e, meta.metric)} — این جایگاه
                تمام‌خودکار و از روی داده است.
              </p>
              <p className="text-sm leading-7 text-warning">
                نقطهٔ ضعف: {weaknessOf(e)}.
              </p>
            </div>
          ))}
        </section>
      ) : null}

      <section className="rounded-2xl border border-muted/20 bg-bg-surface p-5">
        <h2 className="font-bold">این لیست برای چه کسی نیست؟</h2>
        <p className="measure mt-2 text-sm leading-8 text-cream/80">
          {meta.notFor}
        </p>
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
