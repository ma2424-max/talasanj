import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg-base px-6 text-center text-cream">
      <p className="tnum text-6xl font-bold text-gold">۴۰۴</p>
      <h1 className="text-2xl font-bold">صفحه پیدا نشد</h1>
      <p className="max-w-md leading-8 text-cream/70">
        آدرسی که باز کردی وجود ندارد یا جابه‌جا شده است.
      </p>
      <Link
        href="/"
        className="rounded-xl bg-gold px-6 py-3 font-bold text-bg-base"
      >
        بازگشت به صفحهٔ اصلی
      </Link>
    </main>
  );
}
