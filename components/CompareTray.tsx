import { toFaDigits } from "@/lib/format";

type Props = {
  items: { slug: string; nameFa: string }[];
};

/**
 * سینی مقایسهٔ شناور پایین صفحه — نسخهٔ S2 نمایشی است؛
 * تعامل انتخاب/حذف در S6 (دایرکتوری) اضافه می‌شود.
 */
export function CompareTray({ items }: Props) {
  if (items.length === 0) return null;

  const ready = items.length === 2;
  const href = ready
    ? `/compare/${items[0].slug}-vs-${items[1].slug}/`
    : undefined;

  return (
    <div
      role="region"
      aria-label="سینی مقایسه"
      className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-xl items-center justify-between gap-3 rounded-2xl border border-gold/30 bg-bg-surface p-3 shadow-lg"
    >
      <p className="text-sm">
        {toFaDigits(items.length)} پلتفرم برای مقایسه انتخاب شده:{" "}
        <span className="text-cream/70">
          {items.map((i) => i.nameFa).join(" و ")}
        </span>
      </p>
      {ready && href ? (
        <a
          href={href}
          className="shrink-0 rounded-xl bg-gold px-4 py-2 text-sm font-bold text-bg-base"
        >
          مقایسه کن
        </a>
      ) : (
        <span className="shrink-0 rounded-xl border border-muted/30 px-4 py-2 text-sm text-muted">
          یک پلتفرم دیگر انتخاب کن
        </span>
      )}
    </div>
  );
}
