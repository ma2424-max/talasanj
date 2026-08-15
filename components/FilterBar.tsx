type Props = {
  methods: { slug: string; nameFa: string }[];
  /** مقادیر فعلی فیلترها از query string */
  current?: {
    method?: string;
    licensed?: string;
    delivery?: string;
    minScore?: string;
  };
  action?: string;
};

/**
 * نوار فیلتر دایرکتوری — فرم GET استاندارد که بدون JavaScript هم کار می‌کند.
 * ترکیب‌های فیلتر طبق §۱۰.۴ سند ساخت noindex می‌شوند (در لایهٔ صفحه).
 */
export function FilterBar({
  methods,
  current = {},
  action = "/platforms/",
}: Props) {
  return (
    <form
      method="get"
      action={action}
      className="flex flex-wrap items-end gap-3 rounded-2xl border border-muted/20 bg-bg-surface p-4"
    >
      <label className="flex min-w-36 flex-col gap-1 text-xs text-muted">
        روش خرید
        <select
          name="method"
          defaultValue={current.method ?? ""}
          className="rounded-lg border border-muted/30 bg-bg-base px-3 py-2 text-sm text-cream"
        >
          <option value="">همه</option>
          {methods.map((m) => (
            <option key={m.slug} value={m.slug}>
              {m.nameFa}
            </option>
          ))}
        </select>
      </label>

      <label className="flex min-w-32 flex-col gap-1 text-xs text-muted">
        مجوز رسمی
        <select
          name="licensed"
          defaultValue={current.licensed ?? ""}
          className="rounded-lg border border-muted/30 bg-bg-base px-3 py-2 text-sm text-cream"
        >
          <option value="">مهم نیست</option>
          <option value="yes">فقط دارای مجوز</option>
        </select>
      </label>

      <label className="flex min-w-32 flex-col gap-1 text-xs text-muted">
        تحویل فیزیکی
        <select
          name="delivery"
          defaultValue={current.delivery ?? ""}
          className="rounded-lg border border-muted/30 bg-bg-base px-3 py-2 text-sm text-cream"
        >
          <option value="">مهم نیست</option>
          <option value="yes">فقط دارای تحویل</option>
        </select>
      </label>

      <label className="flex min-w-32 flex-col gap-1 text-xs text-muted">
        حداقل امتیاز
        <select
          name="minScore"
          defaultValue={current.minScore ?? ""}
          className="rounded-lg border border-muted/30 bg-bg-base px-3 py-2 text-sm text-cream"
        >
          <option value="">مهم نیست</option>
          <option value="50">۵۰ به بالا</option>
          <option value="75">۷۵ به بالا</option>
        </select>
      </label>

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-xl bg-gold px-5 py-2 text-sm font-bold text-bg-base"
        >
          اعمال فیلتر
        </button>
        <a
          href={action}
          className="rounded-xl border border-muted/30 px-4 py-2 text-sm text-muted"
        >
          حذف فیلترها
        </a>
      </div>
    </form>
  );
}
