const trustItems = [
  { label: "پلتفرم بررسی‌شده", value: "به‌زودی" },
  { label: "آخرین به‌روزرسانی داده‌ها", value: "به‌زودی" },
  { label: "تجربهٔ ثبت‌شدهٔ کاربران", value: "به‌زودی" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg-base text-cream">
      <section className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 px-6 py-16 text-center">
        <p className="rounded-full border border-gold/40 px-4 py-1 text-sm text-gold">
          طلاسنج — نسخهٔ اولیهٔ در حال ساخت
        </p>

        <h1 className="text-4xl font-bold leading-snug md:text-5xl md:leading-snug">
          کدام پلتفرم برای خرید طلا؟
        </h1>

        <p className="max-w-xl text-base leading-8 text-cream/70">
          مقایسهٔ مستقل کارمزد، مجوز و امتیاز پلتفرم‌های خرید طلای آنلاین؛ همهٔ
          داده‌ها منبع‌دار و تاریخ‌دار.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <span className="rounded-xl bg-gold px-6 py-3 font-bold text-bg-base">
            محاسبهٔ هزینهٔ واقعی (به‌زودی)
          </span>
          <span className="rounded-xl border border-gold/40 px-6 py-3 text-gold">
            مشاهدهٔ همهٔ پلتفرم‌ها (به‌زودی)
          </span>
        </div>

        <div className="mt-6 grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
          {trustItems.map((item) => (
            <div key={item.label} className="rounded-xl bg-bg-surface p-4">
              <p className="tnum text-xl font-bold text-gold">{item.value}</p>
              <p className="mt-1 text-xs text-cream/60">{item.label}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
