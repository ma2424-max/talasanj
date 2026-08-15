import type { Metadata } from "next";
import Link from "next/link";
import {
  DataFreshnessBadge,
  EmptyState,
  FilterBar,
  ScoreBadge,
} from "@/components";
import { CompareCheckbox, CompareProvider } from "@/components/CompareSelect";
import { listDirectoryEntries, listMethods } from "@/lib/data/platforms";
import { formatPct, formatToman, toFaDigits } from "@/lib/format";

export const revalidate = 3600;

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function nullsLast(a: number | null, b: number | null): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a - b;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const filtered = Object.keys(sp).length > 0;
  return {
    title:
      "پلتفرم‌های خرید طلای آنلاین — مقایسهٔ کارمزد، مجوز و امتیاز | طلاسنج",
    description:
      "فهرست کامل پلتفرم‌های خرید طلای آنلاین با کارمزد، حداقل خرید، وضعیت مجوز و امتیاز طلاسنج؛ فیلتر کنید و کنار هم مقایسه کنید.",
    /* ترکیب‌های فیلتر noindex؛ فقط نسخهٔ تمیز ایندکس می‌شود — §۱۰.۴ سند ساخت */
    alternates: { canonical: "/platforms/" },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function PlatformsDirectoryPage({
  searchParams,
}: PageProps) {
  const sp = await searchParams;
  const methodFilter = firstParam(sp.method) || null;
  const licensedOnly = firstParam(sp.licensed) === "yes";
  const deliveryOnly = firstParam(sp.delivery) === "yes";
  const minScoreRaw = firstParam(sp.minScore);
  const minScore = minScoreRaw ? Number(minScoreRaw) : null;
  const sort = firstParam(sp.sort) || "score";

  const [entries, methodRows] = await Promise.all([
    listDirectoryEntries(),
    listMethods(),
  ]);

  const filtered = entries.filter((e) => {
    if (methodFilter && !e.platform.methods.includes(methodFilter))
      return false;
    if (licensedOnly && !e.licenses.some((l) => l.status === "verified"))
      return false;
    if (deliveryOnly && e.primaryFee?.physicalDelivery !== true) return false;
    if (
      minScore !== null &&
      (e.score.total === null || e.score.total < minScore)
    )
      return false;
    return true;
  });

  if (sort === "buyFee") {
    filtered.sort((a, b) =>
      nullsLast(
        a.primaryFee?.buyFeePct != null ? Number(a.primaryFee.buyFeePct) : null,
        b.primaryFee?.buyFeePct != null ? Number(b.primaryFee.buyFeePct) : null,
      ),
    );
  } else if (sort === "minBuy") {
    filtered.sort((a, b) =>
      nullsLast(
        a.primaryFee?.minBuyToman ?? null,
        b.primaryFee?.minBuyToman ?? null,
      ),
    );
  } else if (sort === "fresh") {
    filtered.sort((a, b) =>
      nullsLast(
        a.latestDataAt ? -new Date(a.latestDataAt).getTime() : null,
        b.latestDataAt ? -new Date(b.latestDataAt).getTime() : null,
      ),
    );
  } else {
    filtered.sort((a, b) => (b.score.total ?? -1) - (a.score.total ?? -1));
  }

  const faqs = [
    {
      q: "چطور پلتفرم مناسب خرید طلا را انتخاب کنم؟",
      a: "با فیلترها روش، مجوز و تحویل فیزیکی را مشخص کن و بعد جدول را بر اساس امتیاز یا کمترین کارمزد مرتب کن. برای مقایسهٔ دوتایی، تیک «مقایسه» را در دو ردیف بزن.",
    },
    {
      q: "امتیاز طلاسنج دقیقاً یعنی چه؟",
      a: "امتیاز از شش محور (شفافیت کارمزد، مجوز و اعتبار، تجربهٔ کاربران، تسویه و تحویل، پشتیبانی و شفافیت داده) با وزن‌های مشخص ساخته می‌شود؛ جزئیات در صفحهٔ متدولوژی.",
    },
    {
      q: "چرا پلتفرمی در این فهرست نیست یا امتیاز ندارد؟",
      a: "هر پلتفرم باید از دروازهٔ انتشار طلاسنج بگذرد: دادهٔ منبع‌دار و تاریخ‌دار. جای خالی یعنی راستی‌آزمایی در جریان است، نه حذف یا تبلیغ.",
    },
    {
      q: "دادهٔ کارمزدها کی به‌روز می‌شود؟",
      a: "هر عدد تاریخ برداشت دارد و نشان «به‌روزرسانی» در همین صفحه تازگی داده را نشان می‌دهد؛ خطای احتمالی را با دکمهٔ «گزارش دادهٔ نادرست» بگوی.",
    },
  ];

  const jsonLdObjects: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "پلتفرم‌های خرید طلای آنلاین",
      itemListElement: filtered.map((e, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: e.platform.nameFa,
        url: "https://talasanj.org/platforms/" + e.platform.slug + "/",
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
        {
          "@type": "ListItem",
          position: 2,
          name: "پلتفرم‌ها",
          item: "https://talasanj.org/platforms/",
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
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
      <nav aria-label="breadcrumb" className="text-xs text-muted">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="hover:text-gold">
              خانه
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li aria-current="page" className="text-cream">
            پلتفرم‌ها
          </li>
        </ol>
      </nav>

      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">پلتفرم‌های خرید طلای آنلاین</h1>
        <p className="measure rounded-2xl bg-bg-surface p-5 leading-8">
          در حال حاضر {toFaDigits(entries.length)} پلتفرم بررسی‌شده در طلاسنج
          ثبت است؛ کارمزد، مجوز و امتیاز هر یک با منبع و تاریخ مشخص است. فیلتر
          کن، مرتب کن و دو مورد را برای مقایسهٔ دوتایی انتخاب کن.
        </p>
      </header>

      <FilterBar
        methods={methodRows.map((m) => ({ slug: m.slug, nameFa: m.nameFa }))}
        current={{
          method: methodFilter ?? "",
          licensed: licensedOnly ? "yes" : "",
          delivery: deliveryOnly ? "yes" : "",
          minScore: minScoreRaw ?? "",
          sort: sort === "score" ? "" : sort,
        }}
      />

      <CompareProvider>
        {filtered.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-muted/20">
            <table className="w-full min-w-[820px] border-collapse text-sm">
              <caption className="sr-only">
                جدول مقایسهٔ پلتفرم‌های خرید طلا
              </caption>
              <thead className="bg-bg-surface text-xs text-muted">
                <tr>
                  <th className="px-3 py-3 text-start font-medium">مقایسه</th>
                  <th className="px-4 py-3 text-start font-medium">پلتفرم</th>
                  <th className="px-4 py-3 text-start font-medium">امتیاز</th>
                  <th className="px-4 py-3 text-start font-medium">
                    کارمزد خرید
                  </th>
                  <th className="px-4 py-3 text-start font-medium">
                    کارمزد فروش
                  </th>
                  <th className="px-4 py-3 text-start font-medium">
                    حداقل خرید
                  </th>
                  <th className="px-4 py-3 text-start font-medium">مجوز</th>
                  <th className="px-4 py-3 text-start font-medium">
                    تحویل فیزیکی
                  </th>
                  <th className="px-4 py-3 text-start font-medium">تازگی</th>
                  <th className="px-4 py-3 text-start font-medium">پروفایل</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.platform.id} className="border-t border-muted/10">
                    <td className="px-3 py-3">
                      <CompareCheckbox
                        slug={e.platform.slug}
                        nameFa={e.platform.nameFa}
                      />
                    </td>
                    <th className="px-4 py-3 text-start">
                      <span className="font-bold">{e.platform.nameFa}</span>
                      <span className="block text-xs text-muted" dir="ltr">
                        {e.platform.domain}
                      </span>
                    </th>
                    <td className="px-4 py-3">
                      <ScoreBadge
                        score={e.score.total}
                        incomplete={e.score.incomplete}
                        size="sm"
                      />
                    </td>
                    <td className="tnum px-4 py-3">
                      {formatPct(e.primaryFee?.buyFeePct ?? null)}
                    </td>
                    <td className="tnum px-4 py-3">
                      {formatPct(e.primaryFee?.sellFeePct ?? null)}
                    </td>
                    <td className="tnum px-4 py-3">
                      {e.primaryFee?.minBuyToman != null
                        ? formatToman(e.primaryFee.minBuyToman)
                        : "نامشخص"}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {e.licenses.some((l) => l.status === "verified") ? (
                        <span className="text-positive">راستی‌آزمایی‌شده</span>
                      ) : e.licenses.length > 0 ? (
                        <span className="text-warning">در انتظار</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {e.primaryFee?.physicalDelivery == null ? (
                        <span className="text-muted">نامشخص</span>
                      ) : e.primaryFee.physicalDelivery ? (
                        <span className="text-positive">دارد</span>
                      ) : (
                        <span className="text-muted">ندارد</span>
                      )}
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
                        href={`/platforms/${e.platform.slug}/`}
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
            title="با این فیلترها چیزی پیدا نشد"
            body="یکی از فیلترها را حذف کن تا نتیجه ببینی."
            actionLabel="حذف فیلترها"
            actionHref="/platforms/"
          />
        )}
      </CompareProvider>

      <section className="flex flex-col gap-3 rounded-2xl border border-gold/20 bg-bg-surface p-5">
        <h2 className="font-bold text-gold">نمی‌دانی از کجا شروع کنی؟</h2>
        <p className="measure text-sm leading-7 text-cream/80">
          اول با محاسبه‌گر هزینهٔ واقعی ببین برای مبلغ تو کدام مسیر ارزان‌تر
          است، بعد پروفایل دو سه پلتفرم برتر را بخوان و در نهایت آن‌ها را کنار
          هم مقایسه کن.
        </p>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/tools/real-cost/"
            className="rounded-xl bg-gold px-4 py-2 font-bold text-bg-base"
          >
            محاسبه‌گر هزینهٔ واقعی
          </Link>
          <Link
            href="/best/lowest-fee/"
            className="rounded-xl border border-muted/30 px-4 py-2 hover:border-gold"
          >
            کمترین کارمزد
          </Link>
          <Link
            href="/best/physical-delivery/"
            className="rounded-xl border border-muted/30 px-4 py-2 hover:border-gold"
          >
            دارای تحویل فیزیکی
          </Link>
          <Link
            href="/best/licensed/"
            className="rounded-xl border border-muted/30 px-4 py-2 hover:border-gold"
          >
            دارای مجوز رسمی
          </Link>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">راهنمای انتخاب پلتفرم خرید طلا</h2>
        <div className="measure flex flex-col gap-3 text-sm leading-8 text-cream/80">
          <p>
            پلتفرم خوب خرید طلا سه چیز را همزمان دارد: کارمزد شفاف و قابل
            استناد، مجوز معتبر از مراجع رسمی، و سابقهٔ تسویه و تحویل درست. در
            جدول بالا هر سه را می‌توانی همزمان ببینی و مرتب کنی.
          </p>
          <p>
            اگر تازه‌کاری، از صفحهٔ روش‌ها شروع کن تا تفاوت طلای آب‌شده، شمش،
            سکه و صندوق را بفهمی؛ بعد برگرد و با فیلتر «روش خرید» فهرست را محدود
            کن. یادت باشد امتیاز طلاسنج توصیهٔ سرمایه‌گذاری نیست؛ تصمیم نهایی با
            خودت است.
          </p>
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
