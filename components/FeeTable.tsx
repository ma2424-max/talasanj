import type { FieldMeta } from "@/db/schema";
import { formatFaDate, formatPct, formatToman } from "@/lib/format";
import { ConfidenceTag } from "./ConfidenceTag";

export type FeeRow = {
  id: number | string;
  method: string;
  methodNameFa?: string;
  buyFeePct: string | null;
  sellFeePct: string | null;
  minBuyToman: number | null;
  withdrawalFeeToman: number | null;
  physicalDelivery: boolean | null;
  fieldMeta: Record<string, FieldMeta>;
  observedAt: Date | null;
};

type Props = { rows: FeeRow[] };

function boolLabel(value: boolean | null): string {
  if (value === null) return "نامشخص";
  return value ? "دارد" : "ندارد";
}

function Cell({ value, meta }: { value: string; meta?: FieldMeta }) {
  const unknown = value === "نامشخص";
  return (
    <div className="flex flex-col items-start gap-1">
      <span className={unknown ? "text-muted" : "tnum"}>{value}</span>
      {meta ? <ConfidenceTag level={meta.confidence} /> : null}
    </div>
  );
}

/** جدول کارمزدها — قانون طلایی: عدد بدون منبع «نامشخص» است، نه تخمین */
export function FeeTable({ rows }: Props) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-muted/20">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <caption className="sr-only">جدول کارمزدها و شرایط خرید</caption>
        <thead className="bg-bg-surface text-xs text-muted">
          <tr>
            <th className="px-4 py-3 text-start font-medium">روش</th>
            <th className="px-4 py-3 text-start font-medium">کارمزد خرید</th>
            <th className="px-4 py-3 text-start font-medium">کارمزد فروش</th>
            <th className="px-4 py-3 text-start font-medium">حداقل خرید</th>
            <th className="px-4 py-3 text-start font-medium">کارمزد برداشت</th>
            <th className="px-4 py-3 text-start font-medium">تحویل فیزیکی</th>
            <th className="px-4 py-3 text-start font-medium">تاریخ داده</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-muted/10">
              <th className="px-4 py-3 text-start font-medium">
                {row.methodNameFa ?? row.method}
              </th>
              <td className="px-4 py-3">
                <Cell
                  value={formatPct(row.buyFeePct)}
                  meta={row.fieldMeta.buyFeePct}
                />
              </td>
              <td className="px-4 py-3">
                <Cell
                  value={formatPct(row.sellFeePct)}
                  meta={row.fieldMeta.sellFeePct}
                />
              </td>
              <td className="px-4 py-3">
                <Cell
                  value={
                    row.minBuyToman === null
                      ? "نامشخص"
                      : formatToman(row.minBuyToman)
                  }
                  meta={row.fieldMeta.minBuyToman}
                />
              </td>
              <td className="px-4 py-3">
                <Cell
                  value={
                    row.withdrawalFeeToman === null
                      ? "نامشخص"
                      : formatToman(row.withdrawalFeeToman)
                  }
                  meta={row.fieldMeta.withdrawalFeeToman}
                />
              </td>
              <td className="px-4 py-3">
                <Cell
                  value={boolLabel(row.physicalDelivery)}
                  meta={row.fieldMeta.physicalDelivery}
                />
              </td>
              <td className="px-4 py-3 text-muted">
                {row.observedAt
                  ? formatFaDate(row.observedAt.toISOString())
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
