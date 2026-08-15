import type { Metadata } from "next";
import Link from "next/link";
import { listMethods } from "@/lib/data/platforms";

export const metadata: Metadata = {
  title: "روش‌های خرید طلا — از آب‌شده تا صندوق | طلاسنج",
  description:
    "هفت روش خرید طلا در ایران، شفاف و کنار هم: طلای آب‌شده، شمش، سکه، صندوق طلا، طلای زینتی، سپردهٔ طلا و پس‌انداز طلا؛ هزینه‌ها و تفاوت‌ها.",
  alternates: { canonical: "/methods/" },
};

export const revalidate = 3600;

export default async function MethodsHubPage() {
  const methodRows = await listMethods();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "روش‌های خرید طلا",
    url: "https://talasanj.org/methods/",
    itemListElement: methodRows.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: m.nameFa,
      url: "https://talasanj.org/methods/" + m.slug + "/",
    })),
  };

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
            روش‌های خرید طلا
          </li>
        </ol>
      </nav>

      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">روش‌های خرید طلا</h1>
        <p className="measure rounded-2xl bg-bg-surface p-5 leading-8">
          قبل از انتخاب پلتفرم، اول روش خرید را بشناس: هر روش هزینه، ریسک و
          نقدشوندگی متفاوتی دارد. روی هر روش بزن تا توضیح کامل و فهرست
          پلتفرم‌های ارائه‌دهندهٔ آن را ببینی.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {methodRows.map((m) => (
          <Link
            key={m.slug}
            href={`/methods/${m.slug}/`}
            className="flex flex-col gap-2 rounded-2xl border border-muted/20 bg-bg-surface p-5 transition-colors hover:border-gold"
          >
            <p className="font-bold">{m.nameFa}</p>
            <p className="text-sm leading-7 text-cream/70">{m.summary}</p>
          </Link>
        ))}
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
