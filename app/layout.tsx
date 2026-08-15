import type { Metadata } from "next";
import Link from "next/link";
import "@fontsource/vazirmatn/400.css";
import "@fontsource/vazirmatn/500.css";
import "@fontsource/vazirmatn/700.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://talasanj.org"),
  title: "طلاسنج | مقایسه و امتیازدهی پلتفرم‌های خرید طلای آنلاین",
  description:
    "کارمزد، مجوز و امتیاز پلتفرم‌های خرید طلای آنلاین را مقایسه کنید و با محاسبه‌گر هزینهٔ واقعی، ارزان‌ترین مسیر خرید طلا را پیدا کنید. همهٔ داده‌ها منبع‌دار و تاریخ‌دار.",
};

const NAV = [
  { href: "/platforms/", label: "پلتفرم‌ها" },
  { href: "/methods/", label: "روش‌ها" },
  { href: "/funds/", label: "صندوق‌ها" },
  { href: "/guides/", label: "راهنماها" },
  { href: "/glossary/", label: "واژه‌نامه" },
  { href: "/tools/", label: "ابزارها" },
];

const FOOTER_ACCESS = [
  { href: "/platforms/", label: "دایرکتوری پلتفرم‌ها" },
  { href: "/tools/real-cost/", label: "محاسبه‌گر هزینهٔ واقعی" },
  { href: "/methods/", label: "روش‌های خرید طلا" },
  { href: "/funds/", label: "صندوق‌های طلا" },
  { href: "/guides/", label: "راهنماها" },
  { href: "/glossary/", label: "واژه‌نامه" },
];

const FOOTER_TRUST = [
  { href: "/methodology/", label: "متدولوژی امتیازدهی" },
  { href: "/disclosure/", label: "افشای تبلیغات و درآمد" },
  { href: "/about/", label: "دربارهٔ طلاسنج" },
  { href: "/contact/", label: "تماس با ما" },
  { href: "/privacy/", label: "حریم خصوصی" },
  { href: "/terms/", label: "قوانین استفاده" },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-gold focus:px-4 focus:py-2 focus:text-bg-base"
        >
          پرش به محتوای اصلی
        </a>
        <header className="border-b border-muted/15">
          <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
            <Link href="/" className="text-xl font-bold text-gold">
              طلاسنج
            </Link>
            <ul className="flex flex-wrap items-center gap-1 text-sm">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="rounded-lg px-3 py-2 text-cream/80 transition-colors hover:bg-bg-surface hover:text-gold"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>
        <div id="main" className="flex-1">
          {children}
        </div>
        <footer className="border-t border-muted/15">
          <div className="mx-auto grid max-w-5xl gap-8 px-6 py-10 sm:grid-cols-2">
            <nav aria-label="دسترسی سریع">
              <p className="mb-3 text-sm font-bold text-gold">دسترسی سریع</p>
              <ul className="flex flex-col gap-2 text-sm text-cream/70">
                {FOOTER_ACCESS.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:text-gold">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="اعتماد و شفافیت">
              <p className="mb-3 text-sm font-bold text-gold">
                اعتماد و شفافیت
              </p>
              <ul className="flex flex-col gap-2 text-sm text-cream/70">
                {FOOTER_TRUST.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:text-gold">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="border-t border-muted/15 px-6 py-4 text-center text-xs text-muted">
            طلاسنج — مقایسهٔ مستقل پلتفرم‌های خرید طلای آنلاین؛ هیچ‌یک از محتوای
            این سایت توصیهٔ سرمایه‌گذاری نیست.
          </div>
        </footer>
      </body>
    </html>
  );
}
