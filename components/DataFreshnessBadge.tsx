import { daysSince, formatFaDate, toFaDigits } from "@/lib/format";

type Props = {
  /** تاریخ ISO آخرین به‌روزرسانی داده */
  date: string;
  label?: string;
};

/** نشان تازگی داده — هر صفحهٔ داده‌دار این را بالای صفحه دارد */
export function DataFreshnessBadge({ date, label = "به‌روزرسانی" }: Props) {
  const days = daysSince(date);
  const tone =
    days <= 7
      ? "border-positive/40 text-positive"
      : days <= 30
        ? "border-warning/40 text-warning"
        : "border-negative/40 text-negative";
  const relative =
    days <= 0 ? "امروز" : days === 1 ? "دیروز" : `${toFaDigits(days)} روز پیش`;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs ${tone}`}
      title={`${label}: ${formatFaDate(date)}`}
    >
      <span aria-hidden>◷</span>
      <span>
        {label}: {relative}
      </span>
    </span>
  );
}
