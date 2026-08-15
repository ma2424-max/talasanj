import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components";
import { searchAll } from "@/lib/data/platforms";

export const metadata: Metadata = {
  title: "جستجو | طلاسنج",
  /* صفحهٔ نتیجهٔ جستجو هرگز ایندکس نمی‌شود — §۱۲ ماتریس صفحات */
  robots: { index: false, follow: true },
  alternates: { canonical: "/search/" },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = firstParam(sp.q)?.trim() ?? "";
  const results = q.length > 0 ? await searchAll(q) : null;
  const hasResults =
    results !== null &&
    (results.platforms.length > 0 || results.methods.length > 0);

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-10">
      <h1 className="text-3xl font-bold">جستجو</h1>

      <form method="get" action="/search/" className="flex gap-2">
        <label className="sr-only" htmlFor="search-input">
          عبارت جستجو
        </label>
        <input
          id="search-input"
          type="search"
          name="q"
          defaultValue={q}
          autoFocus
          placeholder="نام پلتفرم یا روش خرید…"
          className="w-full rounded-xl border border-muted/30 bg-bg-surface px-4 py-3 text-sm text-cream"
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-gold px-5 py-3 text-sm font-bold text-bg-base"
        >
          جستجو
        </button>
      </form>

      {q.length === 0 ? (
        <p className="text-sm leading-7 text-muted">
          نام یک پلتفرم یا یک روش خرید را بنویس؛ نتایج بر اساس نوع گروه‌بندی
          می‌شوند.
        </p>
      ) : null}

      {results !== null && !hasResults ? (
        <EmptyState
          title={`برای «${q}» نتیجه‌ای نبود`}
          body="شاید آن پلتفرم هنوز در حال راستی‌آزمایی است؛ از مسیرهای محبوب زیر شروع کن."
          actionLabel="همهٔ پلتفرم‌ها"
          actionHref="/platforms/"
        />
      ) : null}

      {results !== null && results.platforms.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-bold">پلتفرم‌ها</h2>
          <ul className="flex flex-col gap-2">
            {results.platforms.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/platforms/${p.slug}/`}
                  className="flex items-center justify-between rounded-xl bg-bg-surface px-4 py-3 transition-colors hover:text-gold"
                >
                  <span className="font-bold">{p.nameFa}</span>
                  <span className="text-xs text-muted" dir="ltr">
                    {p.domain}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {results !== null && results.methods.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-bold">روش‌های خرید</h2>
          <ul className="flex flex-col gap-2">
            {results.methods.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/methods/${m.slug}/`}
                  className="block rounded-xl bg-bg-surface px-4 py-3 transition-colors hover:text-gold"
                >
                  <span className="font-bold">{m.nameFa}</span>
                  {m.summary ? (
                    <span className="block text-xs text-cream/60">
                      {m.summary}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
