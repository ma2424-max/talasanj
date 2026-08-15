import type { Metadata } from "next";
import Link from "next/link";
import { DataFreshnessBadge } from "@/components";
import { GUIDES } from "@/lib/content/guides-registry";
import { toFaDigits } from "@/lib/format";

export const metadata: Metadata = {
  title: "راهنماهای خرید طلا | طلاسنج",
  description:
    "راهنماهای کاربردی و بدون حاشیهٔ طلاسنج برای خرید طلا: شروع خرید آنلاین، شناخت کارمزدها و انتخاب روش درست.",
  alternates: { canonical: "/guides/" },
};

export default function GuidesHubPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "راهنماهای خرید طلا",
    url: "https://talasanj.org/guides/",
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
            راهنماها
          </li>
        </ol>
      </nav>

      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">راهنماهای خرید طلا</h1>
        <p className="measure rounded-2xl bg-bg-surface p-5 leading-8">
          راهنماهای طلاسنج کوتاه، کاربردی و بدون وعدهٔ سود هستند؛ هدفشان این است
          که با چشم باز تصمیم بگیری.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {GUIDES.map((g) => (
          <Link
            key={g.slug}
            href={`/guides/${g.slug}/`}
            className="flex flex-col gap-2 rounded-2xl border border-muted/20 bg-bg-surface p-5 transition-colors hover:border-gold"
          >
            <p className="font-bold">{g.title}</p>
            <p className="text-sm leading-7 text-cream/70">{g.description}</p>
            <div className="flex items-center gap-3 text-xs text-muted">
              <DataFreshnessBadge date={g.updatedAt} />
              <span aria-hidden>·</span>
              <span>حدود {toFaDigits(g.readMinutes)} دقیقه مطالعه</span>
            </div>
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
