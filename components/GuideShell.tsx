import Link from "next/link";
import type { ReactNode } from "react";
import { DataFreshnessBadge, DisclosureBanner } from "@/components";
import { toFaDigits } from "@/lib/format";

type Props = {
  title: string;
  slug: string;
  updatedAt: string;
  readMinutes?: number;
  children: ReactNode;
};

/**
 * پوستهٔ مشترک صفحات راهنما (MDX) — بردکرامب، سربرگ نویسنده/تاریخ،
 * Article JSON-LD و افشای تبلیغات.
 */
export function GuideShell({
  title,
  slug,
  updatedAt,
  readMinutes = 6,
  children,
}: Props) {
  const pageUrl = "https://talasanj.org/guides/" + slug + "/";
  const jsonLdObjects: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      inLanguage: "fa",
      dateModified: updatedAt,
      datePublished: updatedAt,
      author: { "@type": "Organization", name: "تحریریهٔ طلاسنج" },
      publisher: { "@type": "Organization", name: "طلاسنج" },
      mainEntityOfPage: pageUrl,
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
          name: "راهنماها",
          item: "https://talasanj.org/guides/",
        },
        { "@type": "ListItem", position: 3, name: title, item: pageUrl },
      ],
    },
  ];

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-10">
      <nav aria-label="breadcrumb" className="text-xs text-muted">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="hover:text-gold">
              خانه
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li>
            <Link href="/guides/" className="hover:text-gold">
              راهنماها
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li aria-current="page" className="text-cream">
            {title}
          </li>
        </ol>
      </nav>

      <header className="flex flex-col gap-3 border-b border-muted/20 pb-6">
        <h1 className="text-3xl font-bold leading-snug">{title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
          <span>تحریریهٔ طلاسنج</span>
          <span aria-hidden>·</span>
          <DataFreshnessBadge date={updatedAt} />
          <span aria-hidden>·</span>
          <span>حدود {toFaDigits(readMinutes)} دقیقه مطالعه</span>
        </div>
      </header>

      <article className="flex flex-col gap-2">{children}</article>

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
