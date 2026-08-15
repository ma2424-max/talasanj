type Props = {
  /** مقادیر فعلی از query string برای حفظ ورودی کاربر */
  amount?: string;
  price?: string;
  /** پیش‌فرض: submit به همان صفحه؛ در صفحهٔ اصلی به /tools/real-cost/ می‌رود */
  action?: string;
};

/**
 * فرم محاسبهٔ هزینهٔ واقعی — فرم GET استاندارد که بدون JavaScript هم کار می‌کند.
 */
export function RealCostForm({ amount, price, action }: Props) {
  return (
    <form
      method="get"
      action={action}
      className="flex flex-wrap items-end gap-3"
    >
      <label className="flex min-w-44 flex-col gap-1 text-xs text-muted">
        مبلغ خرید (تومان)
        <input
          type="number"
          inputMode="numeric"
          name="amount"
          min={1}
          required
          defaultValue={amount}
          placeholder="۵۰۰۰۰۰۰۰۰"
          className="tnum rounded-lg border border-muted/30 bg-bg-base px-3 py-2 text-sm text-cream"
        />
      </label>
      <label className="flex min-w-44 flex-col gap-1 text-xs text-muted">
        قیمت مرجع هر گرم طلای ۱۸ عیار (تومان)
        <input
          type="number"
          inputMode="numeric"
          name="price"
          min={1}
          required
          defaultValue={price}
          placeholder="۱۰۰۰۰۰۰۰۰"
          className="tnum rounded-lg border border-muted/30 bg-bg-base px-3 py-2 text-sm text-cream"
        />
      </label>
      <button
        type="submit"
        className="rounded-xl bg-gold px-5 py-2 text-sm font-bold text-bg-base"
      >
        محاسبه کن
      </button>
      <p className="w-full text-xs leading-6 text-muted">
        قیمت مرجع را از یک منبع معتبر قیمت طلا بخوان و وارد کن؛ اتصال قیمت
        لحظه‌ای در فازهای بعد به این ابزار می‌آید.
      </p>
    </form>
  );
}
