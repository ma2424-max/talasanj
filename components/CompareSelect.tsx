"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { toFaDigits } from "@/lib/format";

type Item = { slug: string; nameFa: string };

type CompareContextValue = {
  selected: Item[];
  toggle: (item: Item) => void;
  isSelected: (slug: string) => boolean;
};

const CompareContext = createContext<CompareContextValue | null>(null);

/**
 * سینی مقایسهٔ تعاملی — تنها بخش client-side دایرکتوری.
 * خود جدول و محتوا کاملاً SSR است؛ این فقط Progressive Enhancement است.
 */
export function CompareProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Item[]>([]);
  const router = useRouter();

  const toggle = (item: Item) => {
    setSelected((prev) => {
      if (prev.some((p) => p.slug === item.slug)) {
        return prev.filter((p) => p.slug !== item.slug);
      }
      /* حداکثر دو مورد برای مقایسهٔ دوتایی */
      if (prev.length >= 2) return [prev[1], item];
      return [...prev, item];
    });
  };

  const isSelected = (slug: string) => selected.some((p) => p.slug === slug);
  const ready = selected.length === 2;

  return (
    <CompareContext.Provider value={{ selected, toggle, isSelected }}>
      {children}
      {selected.length > 0 ? (
        <div
          role="region"
          aria-label="سینی مقایسه"
          className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-xl items-center justify-between gap-3 rounded-2xl border border-gold/30 bg-bg-surface p-3 shadow-lg"
        >
          <p className="text-sm">
            {toFaDigits(selected.length)} پلتفرم انتخاب شده:{" "}
            <span className="text-cream/70">
              {selected.map((i) => i.nameFa).join(" و ")}
            </span>
          </p>
          {ready ? (
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/compare/${selected[0].slug}-vs-${selected[1].slug}/`,
                )
              }
              className="shrink-0 rounded-xl bg-gold px-4 py-2 text-sm font-bold text-bg-base"
            >
              مقایسه کن
            </button>
          ) : (
            <span className="shrink-0 rounded-xl border border-muted/30 px-4 py-2 text-sm text-muted">
              یک پلتفرم دیگر انتخاب کن
            </span>
          )}
        </div>
      ) : null}
    </CompareContext.Provider>
  );
}

/** چک‌باکس «افزودن به مقایسه» در هر ردیف جدول دایرکتوری */
export function CompareCheckbox({ slug, nameFa }: Item) {
  const ctx = useContext(CompareContext);
  if (!ctx) return null;
  return (
    <label className="inline-flex cursor-pointer items-center gap-1 text-xs text-muted">
      <input
        type="checkbox"
        checked={ctx.isSelected(slug)}
        onChange={() => ctx.toggle({ slug, nameFa })}
        className="h-4 w-4 accent-gold"
        aria-label={`افزودن ${nameFa} به مقایسه`}
      />
      مقایسه
    </label>
  );
}
