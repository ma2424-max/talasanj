const TONES = {
  info: {
    label: "نکته",
    icon: "ℹ️",
    classes: "border-muted/40 bg-bg-surface text-cream",
  },
  warning: {
    label: "هشدار",
    icon: "⚠️",
    classes: "border-warning/50 bg-warning/10 text-cream",
  },
  critical: {
    label: "هشدار مهم",
    icon: "⛔",
    classes: "border-negative/60 bg-negative/10 text-cream",
  },
} as const;

type Props = {
  severity: keyof typeof TONES;
  title: string;
  body?: string;
};

/** پرچم ریسک — برای پلتفرم متوقف، ریسک رگولاتوری و ادعای سنگین */
export function RiskFlag({ severity, title, body }: Props) {
  const tone = TONES[severity];
  return (
    <div
      role={severity === "critical" ? "alert" : "note"}
      className={`flex items-start gap-3 rounded-2xl border p-4 ${tone.classes}`}
    >
      <span aria-hidden className="text-xl leading-none">
        {tone.icon}
      </span>
      <div>
        <p className="font-bold">
          {tone.label}: {title}
        </p>
        {body ? (
          <p className="measure mt-1 text-sm leading-7 text-cream/80">{body}</p>
        ) : null}
      </div>
    </div>
  );
}
