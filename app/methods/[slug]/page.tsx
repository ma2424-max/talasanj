import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components";
import { getDb } from "@/db";
import { methods } from "@/db/schema";
import { getMethodContent } from "@/lib/content/methods-content";
import { listPlatformsForMethod } from "@/lib/data/platforms";
import { formatPct, formatToman } from "@/lib/format";

export const revalidate = 3600;

type PageProps = { params: Promise<{ slug: string }> };

async function loadMethod(slug: string) {
  const db = getDb();
  const [method] = await db
    .select()
    .from(methods)
    .where(eq(methods.slug, slug))
    .limit(1);
  return method ?? null;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const method = await loadMethod(slug);
  if (!method) return { title: "روش پیدا نشد | طلاسنج" };
  return {
    title: `${method.nameFa} چیست و چطور کار می‌کند؟ | طلاسنج`,
    description: method.summary ?? undefined,
    alternates: { canonical: "/methods/" + slug + "/" },
  };
}

export default async function MethodPage({ params }: PageProps) {
  const { slug } = await params;
  const [method, content, providers] = await Promise.all([
    loadMethod(slug),
    Promise.resolve(getMethodContent(slug)),
    listPlatformsForMethod(slug),
  ]);
  if (!method || !content) notFound();

  const pageUrl = "https://talasanj.org/methods/" + slug + "/";
  const jsonLdObjects: Record<string, unknown>[] = [
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
          name: "روش‌های خرید طلا",
          item: "https://talasanj.org/methods/",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: method.nameFa,
          item: pageUrl,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: content.faqs.map((f) => ({
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
            <Link href="/methods/" className="hover:text-gold">
              روش‌های خرید طلا
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li aria-current="page" className="text-cream">
            {method.nameFa}
          </li>
        </ol>
      </nav>

      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">{method.nameFa}</h1>
        <p className="measure rounded-2xl bg-bg-surface p-5 leading-8">
          {content.intro}
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">چطور کار می‌کند؟</h2>
        <ol className="measure flex list-decimal flex-col gap-2 pe-6 leading-8 text-cream/85">
          {content.howItWorks.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">
          پلتفرم‌های ارائه‌دهندهٔ {method.nameFa}
        </h2>
        {providers.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-muted/20">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead className="bg-bg-surface text-xs text-muted">
                <tr>
                  <th className="px-4 py-3 text-start font-medium">پلتفرم</th>
                  <th className="px-4 py-3 text-start font-medium">
                    کارمزد خرید
                  </th>
                  <th className="px-4 py-3 text-start font-medium">
                    کارمزد فروش
                  </th>
                  <th className="px-4 py-3 text-start font-medium">
                    حداقل خرید
                  </th>
                  <th className="px-4 py-3 text-start font-medium">پروفایل</th>
                </tr>
              </thead>
              <tbody>
                {providers.map(({ platform, fee }) => (
                  <tr key={platform.id} className="border-t border-muted/10">
                    <th className="px-4 py-3 text-start font-medium">
                      {platform.nameFa}
                    </th>
                    <td className="tnum px-4 py-3">
                      {formatPct(fee.buyFeePct)}
                    </td>
                    <td className="tnum px-4 py-3">
                      {formatPct(fee.sellFeePct)}
                    </td>
                    <td className="tnum px-4 py-3">
                      {fee.minBuyToman != null
                        ? formatToman(fee.minBuyToman)
                        : "نامشخص"}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/platforms/${platform.slug}/`}
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
            title="فعلاً پلتفرمی با این روش ثبت نشده"
            body="با تکمیل دادهٔ پلتفرم‌ها، ارائه‌دهندگان این روش خودکار اینجا می‌آیند."
          />
        )}
        <Link
          href="/tools/real-cost/"
          className="w-fit rounded-xl bg-gold px-5 py-2.5 text-sm font-bold text-bg-base"
        >
          محاسبهٔ هزینهٔ واقعی این روش
        </Link>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">هزینه‌ها</h2>
        <p className="measure leading-8 text-cream/85">{content.costs}</p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-positive/30 bg-bg-surface p-5">
          <h2 className="font-bold text-positive">مزایا</h2>
          <ul className="mt-2 flex list-disc flex-col gap-1 pe-5 text-sm leading-7 text-cream/80">
            {content.pros.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-negative/30 bg-bg-surface p-5">
          <h2 className="font-bold text-negative">معایب و ریسک‌ها</h2>
          <ul className="mt-2 flex list-disc flex-col gap-1 pe-5 text-sm leading-7 text-cream/80">
            {content.cons.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-2xl border border-gold/20 bg-bg-surface p-5">
        <h2 className="font-bold text-gold">برای چه کسی مناسب است؟</h2>
        <p className="measure mt-2 text-sm leading-8 text-cream/80">
          {content.forWhom}
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-bold">پرسش‌های متداول</h2>
        {content.faqs.map((f) => (
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
