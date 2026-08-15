import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ConfidenceTag,
  DataFreshnessBadge,
  DisclosureBanner,
  EmptyState,
  FeeTable,
  ReportDataButton,
  RiskFlag,
  ScoreBadge,
  SourceCite,
} from "@/components";
import { getPlatformProfile } from "@/lib/data/platforms";
import { computeScore } from "@/lib/scoring";
import { formatFaDate, formatPct, formatToman, toFaDigits } from "@/lib/format";

export const revalidate = 3600;

const LICENSE_LABELS: Record<string, string> = {
  union_guild: "اتحادیهٔ طلا و جواهر",
  enamad: "اینماد",
  samandehi: "ساماندهی",
  online_gold_license: "مجوز سامانهٔ معاملات آنلاین طلای آب‌شده",
  other: "سایر",
};

const LICENSE_STATUS_LABELS: Record<string, string> = {
  verified: "راستی‌آزمایی شد",
  pending: "در انتظار راستی‌آزمایی",
  unverified: "تأیید نشد",
};

const h2 = "text-xl font-bold";
const sectionCls = "flex flex-col gap-4";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getPlatformProfile(slug);
  if (!profile) return { title: "پلتفرم پیدا نشد | طلاسنج" };
  const { platform } = profile;
  return {
    title: `${platform.nameFa} — کارمزد، مجوز، امتیاز و نظرات کاربران | طلاسنج`,
    description: `${platform.nameFa} را بررسی کنید: کارمزد خرید و فروش، مجوزها، امتیاز طلاسنج و تجربهٔ واقعی کاربران.`,
    alternates: { canonical: `/platforms/${slug}/` },
  };
}

export default async function PlatformProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const profile = await getPlatformProfile(slug);
  if (!profile) notFound();

  const {
    platform,
    feeRows,
    licenseRows,
    methodNames,
    approvedReviewCount,
    approvedReviewAvg,
    changeRows,
    siblings,
    latestDataAt,
  } = profile;

  const score = computeScore({
    fees: feeRows,
    licenses: licenseRows,
    review: {
      approvedCount: approvedReviewCount,
      approvedAvg: approvedReviewAvg,
    },
    platformStatus: platform.status,
  });

  const methodsFa = platform.methods.map((s) => methodNames.get(s) ?? s);
  const firstFee = feeRows[0];

  /* سکشن ۳ — خلاصهٔ اتمی: بلوک اصلی استخراج ماشینی (۴۰ تا ۶۰ کلمه) */
  const scoreSentence =
    score.total === null
      ? "دادهٔ کافی برای محاسبهٔ امتیاز هنوز جمع نشده است."
      : `امتیاز فعلی طلاسنج ${toFaDigits(score.total)} از ۱۰۰ است${
          score.incomplete
            ? " و چون پوشش داده کامل نیست، با قاعدهٔ «دادهٔ ناکامل» محاسبه شده"
            : ""
        }.`;
  const atomicSummary = `${platform.nameFa} پلتفرم خرید ${
    methodsFa.length > 0 ? methodsFa.join(" و ") : "طلای آنلاین"
  } است. داده‌های این صفحه از اسناد رسمی و مشاهدهٔ مستقیم جمع‌آوری می‌شود و آخرین به‌روزرسانی آن ${
    latestDataAt ? formatFaDate(latestDataAt) : "نامشخص"
  } است. ${scoreSentence}`;

  const faqs = [
    {
      q: `کارمزد خرید و فروش در ${platform.nameFa} چقدر است؟`,
      a: firstFee
        ? `طبق داده‌های ثبت‌شده، کارمزد خرید ${formatPct(firstFee.buyFeePct)} و کارمزد فروش ${formatPct(firstFee.sellFeePct)} است؛ منبع و تاریخ هر عدد در جدول کارمزدها آمده است.`
        : "هنوز دادهٔ معتبری برای کارمزد این پلتفرم ثبت نشده است؛ پس از راستی‌آزمایی در همین صفحه منتشر می‌شود.",
    },
    {
      q: `حداقل مبلغ خرید در ${platform.nameFa} چقدر است؟`,
      a:
        firstFee?.minBuyToman != null
          ? `حداقل خرید ${formatToman(firstFee.minBuyToman)} است.`
          : "نامشخص است؛ در حال راستی‌آزمایی هستیم.",
    },
    {
      q: `آیا ${platform.nameFa} تحویل فیزیکی دارد؟`,
      a:
        firstFee?.physicalDelivery == null
          ? "نامشخص است؛ در حال راستی‌آزمایی هستیم."
          : firstFee.physicalDelivery
            ? "بله، طبق اطلاعات ثبت‌شده تحویل فیزیکی دارد."
            : "خیر، طبق اطلاعات ثبت‌شده فعلاً تحویل فیزیکی ندارد.",
    },
    {
      q: `امتیاز طلاسنج به ${platform.nameFa} چقدر است؟`,
      a:
        score.total === null
          ? "هنوز دادهٔ کافی برای امتیازدهی نداریم؛ به محض تکمیل پوشش داده، امتیاز در همین صفحه منتشر می‌شود."
          : `امتیاز فعلی ${toFaDigits(score.total)} از ۱۰۰ است. تفکیک شش محور و منابع داده را در همین صفحه ببین.`,
    },
  ];

  /* سکشن ۱۴ — منابع: از fieldMeta کارمزدها و منابع مجوزها جمع می‌شود */
  const sources = new Map<
    string,
    { title: string; url: string; accessedAt?: string }
  >();
  for (const f of feeRows) {
    for (const meta of Object.values(f.fieldMeta)) {
      if (meta.source) {
        sources.set(meta.source, {
          title: `سایت رسمی ${platform.nameFa}`,
          url: meta.source,
          accessedAt: meta.observedAt,
        });
      }
    }
  }
  for (const l of licenseRows) {
    if (l.sourceUrl) {
      sources.set(l.sourceUrl, {
        title: LICENSE_LABELS[l.type] ?? l.type,
        url: l.sourceUrl,
        accessedAt: l.checkedAt?.toISOString(),
      });
    }
  }
  const sourceList = [...sources.values()];

  const pageUrl = "https://talasanj.org/platforms/" + slug + "/";
  const platformUrl = "https://" + platform.domain;
  const jsonLdObjects: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: platform.nameFa,
      url: platformUrl,
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
          name: platform.nameFa,
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
    /* AggregateRating فقط وقتی حداقل ۵ نظر تأییدشده هست — در S9 فعال می‌شود */
  ];

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-10">
      {/* سکشن ۱ — بردکرامب */}
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
          <li aria-current="page" className="text-cream">
            {platform.nameFa}
          </li>
        </ol>
      </nav>

      {platform.isDemo ? (
        <RiskFlag
          severity="info"
          title="دادهٔ نمایشی"
          body="این پلتفرم فقط برای تست قالب است و داده‌هایش واقعی نیست."
        />
      ) : null}

      {platform.status !== "active" ? (
        <RiskFlag
          severity="critical"
          title="فعالیت این پلتفرم متوقف شده است"
          body="قبل از هر اقدام، وضعیت فعلی سرویس را بررسی کن. این صفحه برای حفظ تاریخچه و هشدار باقی می‌ماند."
        />
      ) : null}

      {/* سکشن ۲ — هدر پروفایل */}
      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <span
            aria-hidden
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gold/15 text-2xl font-bold text-gold"
          >
            {platform.nameFa.charAt(0)}
          </span>
          <div>
            <h1 className="text-3xl font-bold">{platform.nameFa}</h1>
            <p className="text-sm text-muted" dir="ltr">
              {platform.domain}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ScoreBadge score={score.total} incomplete={score.incomplete} />
          <ConfidenceTag level={feeRows.length > 0 ? "declared" : "unknown"} />
          {latestDataAt ? (
            <DataFreshnessBadge date={latestDataAt} />
          ) : (
            <span className="rounded-full border border-muted/30 px-3 py-1 text-xs text-muted">
              تاریخ به‌روزرسانی نامشخص
            </span>
          )}
        </div>
      </header>

      {/* سکشن ۳ — خلاصهٔ اتمی */}
      <p className="measure rounded-2xl bg-bg-surface p-5 leading-8">
        {atomicSummary}
      </p>

      {/* سکشن ۴ — کارت اقدام */}
      <div className="rounded-2xl border border-gold/30 bg-bg-surface p-5">
        <a
          href={`/go/${platform.slug}`}
          rel="nofollow"
          className="block rounded-xl bg-gold px-6 py-3 text-center font-bold text-bg-base"
        >
          ورود به سایت {platform.nameFa}
        </a>
        <p className="mt-2 text-center text-xs text-muted">
          در صورت فعال‌بودن لینک همکاری، این موضوع همین‌جا افشا می‌شود و هیچ
          اثری بر امتیاز ندارد.
        </p>
      </div>

      {/* سکشن ۵ — جدول کارمزدها */}
      <section className={sectionCls}>
        <h2 className={h2}>کارمزدها و شرایط خرید</h2>
        {feeRows.length > 0 ? (
          <FeeTable
            rows={feeRows.map((f) => ({
              ...f,
              methodNameFa: methodNames.get(f.method) ?? f.method,
            }))}
          />
        ) : (
          <EmptyState
            title="دادهٔ کارمزد ثبت نشده است"
            body="در حال راستی‌آزمایی هستیم؛ عدد بدون منبع منتشر نمی‌کنیم."
          />
        )}
      </section>

      {/* سکشن ۶ — محاسبه‌گر درون‌صفحه (S5) */}
      <section className={sectionCls}>
        <h2 className={h2}>محاسبهٔ هزینهٔ واقعی در {platform.nameFa}</h2>
        <EmptyState
          title="این ابزار در راه است"
          body="موتور محاسبهٔ هزینهٔ واقعی در اسپرینت بعدی (S5) به همین‌جا می‌آید."
        />
      </section>

      {/* سکشن ۷ — امتیاز تفکیک‌شده: حالا زنده از موتور S4 */}
      <section className={sectionCls}>
        <h2 className={h2}>امتیاز طلاسنج — تفکیک شش محور</h2>
        {score.cappedAt75 ? (
          <p className="rounded-xl border border-warning/40 bg-warning/10 p-3 text-xs leading-6">
            به دلیل پوشش ناکامل داده، سقف امتیاز ۷۵ اعمال شده است؛ با تکمیل
            داده‌ها این سقف برداشته می‌شود.
          </p>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          {score.axes.map((axis) => (
            <div key={axis.key} className="rounded-xl bg-bg-surface p-4">
              <div className="flex items-center justify-between text-sm">
                <span>{axis.label}</span>
                <span className="text-muted">
                  وزن {toFaDigits(axis.weight)}٪
                </span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-bg-base">
                <div
                  className={`h-2 rounded-full ${
                    axis.ratio === null ? "bg-muted/30" : "bg-gold"
                  }`}
                  style={{
                    width:
                      axis.ratio === null
                        ? "0%"
                        : `${Math.round(axis.ratio * 100)}%`,
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-muted">
                {axis.ratio === null
                  ? "نامشخص"
                  : `${toFaDigits(Math.round(axis.ratio * 100))}٪`}{" "}
                — {axis.note}
              </p>
            </div>
          ))}
        </div>
        <a
          href="/methodology/"
          className="text-sm text-gold underline decoration-dotted underline-offset-4"
        >
          متدولوژی امتیازدهی طلاسنج
        </a>
      </section>

      {/* سکشن ۸ — مجوزها و اعتبار */}
      <section className={sectionCls}>
        <h2 className={h2}>مجوزها و اعتبار</h2>
        {licenseRows.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {licenseRows.map((l) => (
              <li
                key={l.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-bg-surface p-4"
              >
                <div>
                  <p className="font-bold">
                    {LICENSE_LABELS[l.type] ?? l.type}
                  </p>
                  {l.issuer ? (
                    <p className="text-xs text-muted">{l.issuer}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-full border border-muted/30 px-2 py-0.5 text-muted">
                    {LICENSE_STATUS_LABELS[l.status] ?? l.status}
                  </span>
                  {l.checkedAt ? (
                    <span className="text-muted">
                      {formatFaDate(l.checkedAt.toISOString())}
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="مجوزی ثبت نشده است"
            body="در حال بررسی مدارک این پلتفرم از مراجع رسمی هستیم."
          />
        )}
        <p className="text-xs leading-6 text-muted">
          طلاسنج هیچ پلتفرمی را «تأیید» نمی‌کند؛ وضعیت نمایش‌داده‌شده صرفاً
          گزارش راستی‌آزمایی مدارک از مراجع رسمی است.
        </p>
      </section>

      {/* سکشن ۹ — جزئیات عملیاتی */}
      <section className={sectionCls}>
        <h2 className={h2}>جزئیات عملیاتی</h2>
        <EmptyState
          title="در حال تکمیل مدل داده هستیم"
          body="روش تحویل، زمان تسویه، احراز هویت و سقف تراکنش با تکمیل مدل داده به این بخش می‌آید."
        />
      </section>

      {/* سکشن ۱۰ — تجربهٔ کاربران */}
      <section className={sectionCls}>
        <h2 className={h2}>تجربهٔ کاربران</h2>
        <EmptyState
          title="به حد نصاب نظرات نرسیده‌ایم"
          body={`برای نمایش میانگین، حداقل ۵ تجربهٔ تأییدشده لازم است (فعلاً ${toFaDigits(approvedReviewCount)}). نظرات کاربران حداکثر ۱۰ امتیاز از ۱۰۰ را تغییر می‌دهد.`}
          actionLabel="ثبت تجربهٔ من"
          actionHref="/contact/?topic=review"
        />
        <p className="text-xs text-muted">
          قواعد در{" "}
          <a
            href="/reviews/policy/"
            className="underline decoration-dotted underline-offset-4 hover:text-gold"
          >
            سیاست نظرات کاربران
          </a>
        </p>
      </section>

      {/* سکشن ۱۱ — مقایسهٔ سریع */}
      <section className={sectionCls}>
        <h2 className={h2}>مقایسهٔ سریع</h2>
        {siblings.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {siblings.map((s) => (
              <li key={s.slug}>
                <a
                  href={`/compare/${slug}-vs-${s.slug}/`}
                  className="rounded-xl border border-muted/30 px-4 py-2 text-sm transition-colors hover:border-gold hover:text-gold"
                >
                  {platform.nameFa} در برابر {s.nameFa}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="هنوز رقیبی برای مقایسه نیست"
            body="با اضافه‌شدن پلتفرم‌های هم‌روش، مقایسهٔ سریع اینجا می‌آید."
          />
        )}
      </section>

      {/* سکشن ۱۲ — تاریخچهٔ داده */}
      <section className={sectionCls}>
        <h2 className={h2}>تاریخچهٔ داده‌ها</h2>
        {changeRows.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {changeRows.slice(0, 5).map((c) => (
              <li key={c.id} className="rounded-xl bg-bg-surface p-3 text-sm">
                <span className="text-muted">
                  {formatFaDate(c.changedAt.toISOString())}:
                </span>{" "}
                فیلد {c.field} از «{c.oldValue ?? "—"}» به «{c.newValue ?? "—"}»
                تغییر کرد
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="هنوز تغییری ثبت نشده است" />
        )}
      </section>

      {/* سکشن ۱۳ — پرسش‌های متداول */}
      <section className={sectionCls}>
        <h2 className={h2}>پرسش‌های متداول</h2>
        <div className="flex flex-col gap-2">
          {faqs.map((f) => (
            <details key={f.q} className="rounded-xl bg-bg-surface p-4">
              <summary className="cursor-pointer font-bold">{f.q}</summary>
              <p className="measure mt-2 text-sm leading-8 text-cream/80">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* سکشن ۱۴ — منابع و استنادها */}
      <section className={sectionCls}>
        <h2 className={h2}>منابع و استنادها</h2>
        {sourceList.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {sourceList.map((s) => (
              <li key={s.url}>
                <SourceCite
                  title={s.title}
                  url={s.url}
                  accessedAt={s.accessedAt}
                />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="منبعی ثبت نشده است" />
        )}
      </section>

      {/* سکشن ۱۵ و ۱۶ — گزارش خطا و حق پاسخ */}
      <section className="flex flex-wrap items-center gap-3">
        <ReportDataButton subject={slug} />
        <a
          href="/corrections/"
          className="text-sm text-muted underline decoration-dotted underline-offset-4 hover:text-gold"
        >
          تاریخچهٔ اصلاحات طلاسنج
        </a>
      </section>

      {/* سکشن ۱۷ — لینک‌های مرتبط */}
      <section className={sectionCls}>
        <h2 className={h2}>مرتبط‌ها</h2>
        <ul className="flex flex-wrap gap-2">
          {platform.methods.map((m) => (
            <li key={m}>
              <Link
                href={`/methods/${m}/`}
                className="rounded-xl bg-bg-surface px-4 py-2 text-sm transition-colors hover:text-gold"
              >
                روش {methodNames.get(m) ?? m}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/platforms/"
              className="rounded-xl bg-bg-surface px-4 py-2 text-sm transition-colors hover:text-gold"
            >
              همهٔ پلتفرم‌ها
            </Link>
          </li>
        </ul>
      </section>

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
