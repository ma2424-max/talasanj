import type { Metadata } from "next";
import { getDb } from "@/db";
import { licenses, methods, platformFees, platforms } from "@/db/schema";

export const metadata: Metadata = {
  title: "بررسی دیتابیس (صفحهٔ داخلی)",
  robots: { index: false, follow: false },
};

/** این صفحه ابزار داخلی تست است و قبل از پرتاب حذف یا محدود می‌شود */
export const dynamic = "force-dynamic";

const card = "rounded-xl bg-bg-surface p-4";

export default async function DbCheckPage() {
  try {
    const db = getDb();
    const [platformRows, feeRows, licenseRows, methodRows] = await Promise.all([
      db.select().from(platforms),
      db.select().from(platformFees),
      db.select().from(licenses),
      db.select().from(methods),
    ]);

    const counts = [
      { label: "پلتفرم‌ها", count: platformRows.length },
      { label: "ردیف‌های کارمزد", count: feeRows.length },
      { label: "مجوزها", count: licenseRows.length },
      { label: "روش‌های خرید", count: methodRows.length },
    ];

    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-16">
        <p className="w-fit rounded-full border border-gold/40 px-4 py-1 text-sm text-gold">
          صفحهٔ داخلی تست — noindex
        </p>
        <h1 className="text-3xl font-bold">اتصال دیتابیس موفق بود ✅</h1>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {counts.map((c) => (
            <div key={c.label} className={card}>
              <p className="tnum text-2xl font-bold text-gold">{c.count}</p>
              <p className="mt-1 text-xs text-cream/60">{c.label}</p>
            </div>
          ))}
        </div>
        <h2 className="mt-4 text-xl font-bold">پلتفرم‌های داخل دیتابیس</h2>
        <ul className="flex flex-col gap-2">
          {platformRows.map((p) => (
            <li key={p.id} className={card}>
              <span className="font-bold">{p.nameFa}</span>{" "}
              <span className="text-sm text-cream/60">({p.slug})</span>
              {p.isDemo ? (
                <span className="ms-2 rounded-full bg-gold/15 px-2 py-0.5 text-xs text-gold">
                  دادهٔ نمایشی — برای تست
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </main>
    );
  } catch (e) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 px-6 py-16">
        <h1 className="text-3xl font-bold">اتصال دیتابیس برقرار نشد ❌</h1>
        <p className="leading-8 text-cream/70">
          پیام خطا: {e instanceof Error ? e.message : "خطای ناشناخته"}
        </p>
        <p className="leading-8 text-cream/70">
          این سه مورد را چک کن: فایل .env.local کنار package.json وجود دارد؛
          داخلش DATABASE_URL با رشتهٔ Neon پر شده؛ و دستورهای npm run db:push و
          npm run db:seed را به ترتیب اجرا کرده‌ای.
        </p>
      </main>
    );
  }
}
