import Link from "next/link";
import type { ReactNode } from "react";
import { ToolPanel } from "./ToolPanel";

type Props = {
  title: string;
  slug: string;
  intro: string;
  method: ReactNode;
  children: ReactNode;
  result: ReactNode;
  faqs: { q: string; a: string }[];
};

/** پوستهٔ مشترک ابزارها؛ فرم‌های GET بدون JavaScript هم کار می‌کنند. */
export function ToolPageShell({
  title,
  slug,
  intro,
  method,
  children,
  result,
  faqs,
}: Props) {
  const pageUrl = "https://talasanj.org/tools/" + slug + "/";
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: title,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      inLanguage: "fa",
      url: pageUrl,
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
        { "@type": "ListItem", position: 3, name: title, item: pageUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
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
            {title}
          </li>
        </ol>
      </nav>
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="measure rounded-2xl bg-bg-surface p-5 leading-8">
          {intro}
        </p>
      </header>
      <ToolPanel title="ورودی محاسبه" howItWorks={method}>
        {children}
      </ToolPanel>
      {result}
      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-bold">پرسش‌های متداول</h2>
        {faqs.map((faq) => (
          <details key={faq.q} className="rounded-xl bg-bg-surface p-4">
            <summary className="cursor-pointer font-bold">{faq.q}</summary>
            <p className="measure mt-2 text-sm leading-8 text-cream/80">
              {faq.a}
            </p>
          </details>
        ))}
      </section>
      {jsonLd.map((value, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(value).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </main>
  );
}
