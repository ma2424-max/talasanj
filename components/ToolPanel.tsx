import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  /** محتوای باکس «چطور محاسبه شد؟» — فرمول و منابع؛ پیش‌فرض باز است */
  howItWorks: ReactNode;
  children: ReactNode;
};

/** قاب استاندارد همهٔ ابزارهای محاسباتی — §۸.۷ سند ساخت */
export function ToolPanel({ title, description, howItWorks, children }: Props) {
  return (
    <section className="rounded-2xl border border-gold/20 bg-bg-surface p-6">
      <h2 className="text-xl font-bold">{title}</h2>
      {description ? (
        <p className="measure mt-1 text-sm leading-7 text-cream/70">
          {description}
        </p>
      ) : null}
      <div className="mt-4">{children}</div>
      <details
        open
        className="mt-6 rounded-xl border border-muted/20 bg-bg-base p-4"
      >
        <summary className="cursor-pointer font-bold text-gold">
          چطور محاسبه شد؟
        </summary>
        <div className="measure mt-2 text-sm leading-8 text-cream/80">
          {howItWorks}
        </div>
      </details>
    </section>
  );
}
