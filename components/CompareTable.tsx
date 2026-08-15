import type { ReactNode } from "react";

export type CompareRow = {
  label: string;
  a: ReactNode;
  b: ReactNode;
  /** برندهٔ ردیف فقط وقتی اختلاف معنادار است؛ در غیر این صورت null */
  better?: "a" | "b" | null;
};

type Props = {
  nameA: string;
  nameB: string;
  rows: CompareRow[];
};

/** جدول مقایسهٔ کنارهم — برنده فقط با اختلاف معنادار علامت می‌خورد */
export function CompareTable({ nameA, nameB, rows }: Props) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-muted/20">
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <thead className="bg-bg-surface">
          <tr>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted">
              معیار
            </th>
            <th className="px-4 py-3 text-start font-bold">{nameA}</th>
            <th className="px-4 py-3 text-start font-bold">{nameB}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-t border-muted/10">
              <th className="px-4 py-3 text-start text-xs font-medium text-muted">
                {row.label}
              </th>
              <td
                className={`px-4 py-3 ${
                  row.better === "a" ? "bg-positive/10 font-bold" : ""
                }`}
              >
                {row.a}
              </td>
              <td
                className={`px-4 py-3 ${
                  row.better === "b" ? "bg-positive/10 font-bold" : ""
                }`}
              >
                {row.b}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
