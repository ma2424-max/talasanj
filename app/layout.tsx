import type { Metadata } from "next";
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
