import Link from "next/link";
import {
  DataFreshnessBadge,
  DisclosureBanner,
  EmptyState,
  ScoreBadge,
  ToolPanel,
} from "@/components";
import { RealCostForm } from "@/components/RealCostForm";
import {
  getSiteStats,
  listDirectoryEntries,
  listMethods,
} from "@/lib/data/platforms";
import { formatPct, toFaDigits } from "@/lib/format";

export const revalidate = 3600;

export default async function HomePage() {
  const [stats, entries, methodRows] = await Promise.all([
    getSiteStats(),
    listDirectoryEntries(),
    listMethods(),
  ]);

  const topPlatforms = entries
    .filter((e) => e.score.total !== null)
    .sort((a, b) => (b.score.total ?? 0) - (a.score.total ?? 0))
    .slice(0, 5);

  const faqs = [
    {
      q: "طلاسنج رایگان است؟",
      a: "بله؛ همهٔ ابزارها، داده‌ها و مقایسه‌ها برای کاربر رایگان است و تا پایان ماه سوم هیچ تبلیغی نمایش داده نمی‌شود.",
    },
    {
      q: "طلاسنج چطور به پلتفرم‌ها امتیاز می‌دهد؟",
      a: "شش محور با وزن مشخص: شفافیت کارمزد، مجوز و اعتبار، تجربهٔ کاربران، تسویه و تحویل، پشتیبانی و شفافیت داده. اگر دادهٔ کافی نباشد، سقف امتیاز ۷۵ اعمال می‌شود. جزئیات در صفحهٔ متدولوژی.",
    },
    {
      q: "آیا طلاسنج توصیهٔ سرمایه‌گذاری می‌کند؟",
      a: "خیر. طلاسنج فقط داده‌های منبع‌دار را مقایسه می‌کند؛ تصمیم نهایی خرید همیشه با خود توست.",
    },
    {
      q: "طلاسنج از کجا درآمد دارد؟",
      a: "مدل درآمدی ما کاملاً شفاف و در صفحهٔ افشای تبلیغات نوشته شده؛ هیچ پلتفرمی نمی‌تواند رتبه بخرد و دیوار بین تحریریه و تبلیغات محکم است.",
    },
  ];

  const jsonLdObjects: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "طلاسنج",
      url: "https://talasanj.org/",
      inLanguage: "fa",
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "طلاسنج",
      url: "https://talasanj.org/",
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
    <main className="flex flex-col gap-16 pb-16">
      {/* سکشن ۱ — هیرو */}
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 px-6 pt-20 text-center">
        <h1 className="text-4xl font-bold leading-snug md:text-5xl md:leading-snug">
          کدام پلتفرم برای خرید طلا؟
        </h1>
        <p className="max-w-xl text-base leading-8 text-cream/70">
          مقایسهٔ مستقل کارمزد، مجوز و امتیاز پلتفرم‌های خرید طلای آنلاین؛ همهٔ
          داده‌ها منبع‌دار و تاریخ‌دار.
        </p>
        <form
          method="get"
          action="/search/"
          className="flex w-full max-w-md gap-2"
        >
          <label className="sr-only" htmlFor="hero-search">
            جستجوی پلتفرم
          </label>
          <input
            id="hero-search"
            type="search"
            name="q"
            placeholder="نام پلتفرم را جستجو کن…"
            className="w-full rounded-xl border border-muted/30 bg-bg-surface px-4 py-3 text-sm text-cream"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl border border-gold/40 px-4 py-3 text-sm font-bold text-gold"
          >
            جستجو
          </button>
        </form>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/tools/real-cost/"
            className="rounded-xl bg-gold px-6 py-3 font-bold text-bg-base"
          >
            محاسبهٔ هزینهٔ واقعی
          </Link>
          <Link
            href="/platforms/"
            className="rounded-xl border border-gold/40 px-6 py-3 text-gold"
          >
            مشاهدهٔ همهٔ پلتفرم‌ها
          </Link>
        </div>
      </section>

      {/* سکشن ۲ — نوار اعتماد: اعداد زنده از دیتابیس */}
      <section className="mx-auto w-full max-w-3xl px-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-bg-surface p-4 text-center">
            <p className="tnum text-2xl font-bold text-gold">
              {stats.platformCount > 0
                ? toFaDigits(stats.platformCount)
                : "به‌زودی"}
            </p>
            <p className="mt-1 text-xs text-cream/60">پلتفرم بررسی‌شده</p>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 rounded-xl bg-bg-surface p-4 text-center">
            {stats.latestDataAt ? (
              <DataFreshnessBadge date={stats.latestDataAt} />
            ) : (
              <p className="tnum text-2xl font-bold text-gold">به‌زودی</p>
            )}
            <p className="text-xs text-cream/60">تازگی داده‌ها</p>
          </div>
          <div className="rounded-xl bg-bg-surface p-4 text-center">
            <p className="tnum text-2xl font-bold text-gold">
              {stats.reviewCount > 0
                ? toFaDigits(stats.reviewCount)
                : "به‌زودی"}
            </p>
            <p className="mt-1 text-xs text-cream/60">
              تجربهٔ تأییدشدهٔ کاربران
            </p>
          </div>
        </div>
      </section>

      {/* سکشن ۳ — ابزار شاخص، نسخهٔ جاسازی‌شده */}
      <section className="mx-auto w-full max-w-3xl px-6">
        <ToolPanel
          title="محاسبه‌گر هزینهٔ واقعی"
          description="ببین برای مبلغ تو، پس از کسر کارمزد و مالیات، دقیقاً چقدر طلا می‌گیری."
          howItWorks={
            <p>
              فرمول: مبلغ خالص طلا = مبلغ ورودی − کارمزد خرید − مالیات بر
              کارمزد؛ معادل طلا = مبلغ خالص ÷ قیمت مرجع هر گرم.
            </p>
          }
        >
          <RealCostForm action="/tools/real-cost/" />
        </ToolPanel>
      </section>

      {/* سکشن ۴ — برترین‌های طلاسنج */}
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold">برترین‌های طلاسنج</h2>
          <Link
            href="/platforms/"
            className="text-sm text-gold underline decoration-dotted underline-offset-4"
          >
            دایرکتوری کامل
          </Link>
        </div>
        {topPlatforms.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-muted/20">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead className="bg-bg-surface text-xs text-muted">
                <tr>
                  <th className="px-4 py-3 text-start font-medium">رتبه</th>
                  <th className="px-4 py-3 text-start font-medium">پلتفرم</th>
                  <th className="px-4 py-3 text-start font-medium">امتیاز</th>
                  <th className="px-4 py-3 text-start font-medium">
                    کارمزد خرید
                  </th>
                  <th className="px-4 py-3 text-start font-medium">تازگی</th>
                  <th className="px-4 py-3 text-start font-medium">پروفایل</th>
                </tr>
              </thead>
              <tbody>
                {topPlatforms.map((e, i) => (
                  <tr key={e.platform.id} className="border-t border-muted/10">
                    <td className="tnum px-4 py-3 font-bold text-gold">
                      {toFaDigits(i + 1)}
                    </td>
                    <th className="px-4 py-3 text-start font-medium">
                      {e.platform.nameFa}
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
            title="به‌زودی"
            body="جدول برترین‌ها با تکمیل دادهٔ پلتفرم‌ها فعال می‌شود."
          />
        )}
      </section>

      {/* سکشن ۵ — روش‌های خرید طلا */}
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6">
        <h2 className="text-2xl font-bold">روش‌های خرید طلا</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {methodRows.map((m) => (
            <Link
              key={m.slug}
              href={`/methods/${m.slug}/`}
              className="flex flex-col gap-1 rounded-2xl border border-muted/20 bg-bg-surface p-4 transition-colors hover:border-gold"
            >
              <p className="font-bold">{m.nameFa}</p>
              <p className="text-sm leading-7 text-cream/70">{m.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* سکشن ۶ — چطور امتیاز می‌دهیم */}
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6">
        <h2 className="text-2xl font-bold">چطور امتیاز می‌دهیم؟</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-bg-surface p-4">
            <p className="font-bold text-gold">۱. دادهٔ منبع‌دار</p>
            <p className="mt-1 text-sm leading-7 text-cream/70">
              هر عدد منبع و تاریخ دارد؛ عدد بدون منبع «نامشخص» است، نه تخمین.
            </p>
          </div>
          <div className="rounded-2xl bg-bg-surface p-4">
            <p className="font-bold text-gold">۲. شش محور مشخص</p>
            <p className="mt-1 text-sm leading-7 text-cream/70">
              کارمزد، اعتبار، تجربهٔ کاربران، تسویه، پشتیبانی و شفافیت داده با
              وزن‌های ثابت.
            </p>
          </div>
          <div className="rounded-2xl bg-bg-surface p-4">
            <p className="font-bold text-gold">۳. بازبینی دوره‌ای</p>
            <p className="mt-1 text-sm leading-7 text-cream/70">
              داده‌ها به‌روز می‌شوند و تاریخچهٔ تغییرات علناً نمایش داده می‌شود.
            </p>
          </div>
        </div>
        <Link
          href="/methodology/"
          className="w-fit text-sm text-gold underline decoration-dotted underline-offset-4"
        >
          متدولوژی کامل امتیازدهی
        </Link>
      </section>

      {/* سکشن ۷ — تازه‌ترین راهنماها و داده‌ها */}
      <section className="mx-auto w-full max-w-3xl px-6">
        <EmptyState
          title="راهنماها و داده‌های استنادپذیر در راه‌اند"
          body="بخش راهنماها، واژه‌نامه و صفحات داده در اسپرینت محتوا (S7) فعال می‌شود."
        />
      </section>

      {/* سکشن ۸ — تجربهٔ کاربران */}
      <section className="mx-auto w-full max-w-3xl px-6">
        <EmptyState
          title="تجربهٔ کاربران به‌زودی فعال می‌شود"
          body="ثبت و نمایش تجربهٔ تأییدشدهٔ کاربران در اسپرینت S9 می‌آید؛ میانگین هر پلتفرم فقط با حداقل ۵ تجربهٔ تأییدشده نمایش داده می‌شود."
        />
      </section>

      {/* سکشن ۹ — پرسش‌های پرتکرار */}
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6">
        <h2 className="text-2xl font-bold">پرسش‌های پرتکرار</h2>
        {faqs.map((f) => (
          <details key={f.q} className="rounded-xl bg-bg-surface p-4">
            <summary className="cursor-pointer font-bold">{f.q}</summary>
            <p className="measure mt-2 text-sm leading-8 text-cream/80">
              {f.a}
            </p>
          </details>
        ))}
      </section>

      {/* سکشن ۱۰ — افشا و دیسکلیمر */}
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-6">
        <DisclosureBanner variant="general" />
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
