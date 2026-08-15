import type { Metadata } from "next";
import Link from "next/link";
import { DataFreshnessBadge, EmptyState, SourceCite } from "@/components";
import { listFunds } from "@/lib/data/platforms";
import { formatPct, formatToman } from "@/lib/format";

export const metadata: Metadata = {
  title: "صندوق‌های طلا — داده‌های منبع‌دار | طلاسنج",
  description:
    "فهرست صندوق‌های طلای ثبت‌شده با کارمزد، حداقل سرمایه‌گذاری، مدیر و منبع داده.",
  alternates: { canonical: "/funds/" },
};
export const revalidate = 3600;

export default async function FundsPage() {
  const rows = await listFunds();
  const latest =
    rows
      .map((row) => row.updatedAt)
      .sort((a, b) => b.getTime() - a.getTime())[0]
      ?.toISOString() ?? null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "صندوق‌های طلا",
    url: "https://talasanj.org/funds/",
    itemListElement: rows.map((row, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: row.nameFa,
    })),
  };
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
      <nav aria-label="breadcrumb" className="text-xs text-muted">
        <ol className="flex gap-1">
          <li>
            <Link href="/">خانه</Link>
          </li>
          <li aria-hidden>›</li>
          <li aria-current="page">صندوق‌های طلا</li>
        </ol>
      </nav>
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">صندوق‌های طلا</h1>
          {latest ? <DataFreshnessBadge date={latest} /> : null}
        </div>
        <p className="measure rounded-2xl bg-bg-surface p-5 leading-8">
          فقط داده‌های قابل‌استناد نمایش داده می‌شوند. نبود یک صندوق یا عدد یعنی
          داده هنوز وارد یا راستی‌آزمایی نشده است.
        </p>
      </header>
      {rows.length ? (
        <div className="overflow-x-auto rounded-2xl border border-muted/20">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead className="bg-bg-surface text-xs text-muted">
              <tr>
                <th className="px-4 py-3 text-start">نماد</th>
                <th className="px-4 py-3 text-start">نام</th>
                <th className="px-4 py-3 text-start">نوع</th>
                <th className="px-4 py-3 text-start">کارمزد مدیریت</th>
                <th className="px-4 py-3 text-start">حداقل سرمایه</th>
                <th className="px-4 py-3 text-start">دارایی پایه</th>
                <th className="px-4 py-3 text-start">مدیر</th>
                <th className="px-4 py-3 text-start">بازارگردان</th>
                <th className="px-4 py-3 text-start">منبع</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-muted/10">
                  <th className="tnum px-4 py-3 text-start text-gold">
                    {row.symbol}
                  </th>
                  <td className="px-4 py-3">{row.nameFa}</td>
                  <td className="px-4 py-3">
                    {row.type === "etf" ? "قابل معامله در بورس" : "بازارگردانی"}
                  </td>
                  <td className="tnum px-4 py-3">
                    {formatPct(row.managementFeePct)}
                  </td>
                  <td className="tnum px-4 py-3">
                    {row.minInvestmentToman === null
                      ? "نامشخص"
                      : formatToman(row.minInvestmentToman)}
                  </td>
                  <td className="px-4 py-3">{row.underlying ?? "نامشخص"}</td>
                  <td className="px-4 py-3">{row.manager ?? "نامشخص"}</td>
                  <td className="px-4 py-3">{row.marketMaker ?? "نامشخص"}</td>
                  <td className="px-4 py-3">
                    {row.sourceUrl ? (
                      <SourceCite
                        title="اطلاعات رسمی صندوق"
                        url={row.sourceUrl}
                        accessedAt={row.updatedAt.toISOString()}
                      />
                    ) : (
                      "نامشخص"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="هنوز صندوقی از دروازهٔ داده عبور نکرده"
          body="هیچ صندوق نمونه یا عدد ساختگی نمایش نمی‌دهیم؛ جدول با ورود دادهٔ رسمی پر می‌شود."
        />
      )}
      <section className="rounded-2xl bg-bg-surface p-5">
        <h2 className="font-bold">این صفحه رتبه‌بندی بازده نیست</h2>
        <p className="measure mt-2 text-sm leading-8 text-cream/80">
          برای شناخت سازوکار صندوق، شرح روش را بخوان و پیش از معامله، اطلاعات
          رسمی بازار سرمایه را بررسی کن.
        </p>
        <Link
          href="/methods/gold-fund/"
          className="mt-3 inline-block text-sm text-gold underline"
        >
          صندوق طلا چطور کار می‌کند؟
        </Link>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </main>
  );
}
