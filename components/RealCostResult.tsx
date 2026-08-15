import type { RealCostResult as Result } from "@/lib/calc/real-cost";
import { formatGrams, formatToman, toFaDigits } from "@/lib/format";

type Props = {
  result: Result;
  title?: string;
};

/** کارت تفکیک نتیجهٔ محاسبهٔ هزینهٔ واقعی */
export function RealCostResult({ result, title }: Props) {
  const rows = [
    { label: "کارمزد خرید", value: formatToman(result.feeToman) },
    {
      label: result.vatIncluded
        ? "مالیات بر کارمزد"
        : "مالیات (نرخ در انتظار تأیید رسمی)",
      value: formatToman(result.vatToman),
    },
    {
      label: "مبلغ خالص تبدیل به طلا",
      value: formatToman(result.netGoldToman),
    },
    { label: "معادل تقریبی طلا", value: formatGrams(result.goldGrams) },
    {
      label: "هزینهٔ مؤثر خرید",
      value: `${toFaDigits(result.effectiveFeePct.toFixed(2).replace(".", "٫"))}٪`,
    },
  ];

  return (
    <div className="rounded-xl border border-gold/30 bg-bg-base p-4">
      {title ? <p className="mb-3 font-bold text-gold">{title}</p> : null}
      <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between gap-2 rounded-lg bg-bg-surface px-3 py-2"
          >
            <dt className="text-xs text-muted">{r.label}</dt>
            <dd className="tnum text-sm font-bold">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
