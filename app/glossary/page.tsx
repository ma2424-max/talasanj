import type { Metadata } from "next";
import Link from "next/link";
import { GLOSSARY_TERMS } from "@/lib/content/glossary-terms";

export const metadata: Metadata = {
  title: "واژه‌نامهٔ طلا — اصطلاحات بازار طلا به زبان ساده | طلاسنج",
  description:
    "طلای آب‌شده، اجرت، مظنه، حباب سکه، عیار، سوت و بقیهٔ اصطلاحات بازار طلا — کوتاه و به زبان ساده.",
  alternates: { canonical: "/glossary/" },
};

export default function GlossaryHubPage() {
  const terms = [...GLOSSARY_TERMS].sort((a, b) =>
    a.term.localeCompare(b.term, "fa"),
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "واژه‌نامهٔ طلا",
    url: "https://talasanj.org/glossary/",
    inLanguage: "fa",
    hasDefinedTerm: terms.map((t) => ({
      "@type": "DefinedTerm",
      name: t.term,
      description: t.shortDef,
      url: "https://talasanj.org/glossary/" + t.slug + "/",
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
            واژه‌نامه
          </li>
        </ol>
      </nav>

      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">واژه‌نامهٔ طلا</h1>
        <p className="measure rounded-2xl bg-bg-surface p-5 leading-8">
          اصطلاحات بازار طلا به زبان ساده؛ هر اصطلاح یک تعریف کوتاه و یک توضیح
          کامل دارد و به اصطلاحات مرتبط وصل است.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {terms.map((t) => (
          <Link
            key={t.slug}
            href={`/glossary/${t.slug}/`}
            className="flex flex-col gap-1 rounded-2xl border border-muted/20 bg-bg-surface p-4 transition-colors hover:border-gold"
          >
            <p className="font-bold">{t.term}</p>
            <p className="text-sm leading-7 text-cream/70">{t.shortDef}</p>
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
