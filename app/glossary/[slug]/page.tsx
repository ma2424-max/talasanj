import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GLOSSARY_TERMS } from "@/lib/content/glossary-terms";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return GLOSSARY_TERMS.map((t) => ({ slug: t.slug }));
}

function findTerm(slug: string) {
  return GLOSSARY_TERMS.find((t) => t.slug === slug) ?? null;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const term = findTerm(slug);
  if (!term) return { title: "واژه پیدا نشد | طلاسنج" };
  return {
    title: `${term.term} چیست؟ | واژه‌نامهٔ طلاسنج`,
    description: term.shortDef,
    alternates: { canonical: "/glossary/" + slug + "/" },
  };
}

export default async function GlossaryTermPage({ params }: PageProps) {
  const { slug } = await params;
  const term = findTerm(slug);
  if (!term) notFound();

  const relatedTerms = term.related
    .map((r) => GLOSSARY_TERMS.find((t) => t.slug === r))
    .filter((t): t is NonNullable<typeof t> => t != null);

  const pageUrl = "https://talasanj.org/glossary/" + slug + "/";
  const jsonLdObjects: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "DefinedTerm",
      name: term.term,
      description: term.longDef,
      inLanguage: "fa",
      url: pageUrl,
      inDefinedTermSet: "https://talasanj.org/glossary/",
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
          name: "واژه‌نامه",
          item: "https://talasanj.org/glossary/",
        },
        { "@type": "ListItem", position: 3, name: term.term, item: pageUrl },
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
            <Link href="/glossary/" className="hover:text-gold">
              واژه‌نامه
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li aria-current="page" className="text-cream">
            {term.term}
          </li>
        </ol>
      </nav>

      <h1 className="text-3xl font-bold">{term.term} چیست؟</h1>

      <p className="measure rounded-2xl bg-bg-surface p-5 leading-8 font-medium">
        {term.shortDef}
      </p>

      <p className="measure leading-8 text-cream/85">{term.longDef}</p>

      {relatedTerms.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold">اصطلاحات مرتبط</h2>
          <ul className="flex flex-wrap gap-2">
            {relatedTerms.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/glossary/${r.slug}/`}
                  className="rounded-xl bg-bg-surface px-4 py-2 text-sm transition-colors hover:text-gold"
                >
                  {r.term}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Link
        href="/glossary/"
        className="w-fit text-sm text-gold underline decoration-dotted underline-offset-4"
      >
        بازگشت به واژه‌نامه
      </Link>

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
