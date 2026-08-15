import { toFaDigits } from "@/lib/format";

type Props = {
  score: number | null;
  /** پوشش داده زیر آستانه → سقف امتیاز ۷۵ (§۷ سند ساخت) */
  incomplete?: boolean;
  size?: "sm" | "md" | "lg";
};

/** نشان امتیاز طلاسنج؛ بدون دادهٔ کافی همیشه «نامشخص» می‌ماند */
export function ScoreBadge({ score, incomplete = false, size = "md" }: Props) {
  const sizes = {
    sm: "h-10 w-10 text-xs",
    md: "h-14 w-14 text-lg",
    lg: "h-20 w-20 text-2xl",
  } as const;

  if (score === null) {
    return (
      <span
        className={`inline-flex flex-col items-center justify-center rounded-full border border-muted/40 text-muted ${sizes[size]}`}
        aria-label="دادهٔ ناکامل"
        title="برای این مورد هنوز دادهٔ کافی نداریم"
      >
        <span className="text-[0.6em] font-bold leading-none">نامشخص</span>
      </span>
    );
  }

  const capped = incomplete ? Math.min(score, 75) : score;
  const tone =
    capped >= 75
      ? "border-gold text-gold"
      : capped >= 50
        ? "border-warning text-warning"
        : "border-negative text-negative";

  return (
    <span
      className={`inline-flex flex-col items-center justify-center rounded-full border-2 bg-bg-surface ${tone} ${sizes[size]}`}
      role="img"
      aria-label={`امتیاز طلاسنج: ${toFaDigits(capped)} از ۱۰۰${incomplete ? " (دادهٔ ناکامل)" : ""}`}
      title={incomplete ? "دادهٔ ناکامل — سقف امتیاز ۷۵" : undefined}
    >
      <span className="tnum font-bold leading-none">{toFaDigits(capped)}</span>
      <span className="text-[0.55em] leading-none opacity-70">از ۱۰۰</span>
    </span>
  );
}
