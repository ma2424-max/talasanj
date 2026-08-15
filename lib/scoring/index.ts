import type { FieldMeta } from "@/db/schema";

/**
 * موتور امتیازدهی شش‌محورهٔ طلاسنج — §۷ سند ساخت.
 * توابع خالص و بدون وابستگی جانبی تا صددرصد تست‌پذیر باشند.
 */

export type AxisKey =
  | "feeTransparency"
  | "legitimacy"
  | "userExperience"
  | "settlement"
  | "support"
  | "dataTransparency";

export const AXIS_WEIGHTS: Record<AxisKey, number> = {
  feeTransparency: 25,
  legitimacy: 25,
  userExperience: 15,
  settlement: 15,
  support: 10,
  dataTransparency: 10,
};

export const AXIS_LABELS: Record<AxisKey, string> = {
  feeTransparency: "شفافیت کارمزد",
  legitimacy: "مجوز و اعتبار",
  userExperience: "تجربهٔ کاربران",
  settlement: "تسویه و تحویل",
  support: "پشتیبانی",
  dataTransparency: "شفافیت داده",
};

/** قواعد قفل‌شده — §۷ سند ساخت */
export const INCOMPLETE_CAP = 75;
export const RISK_CAP = 20;
export const MIN_REVIEWS = 5;
export const REVIEW_MAX_POINTS = 10;

export type FeeInput = {
  buyFeePct: string | null;
  sellFeePct: string | null;
  minBuyToman: number | null;
  withdrawalFeeToman: number | null;
  physicalDelivery: boolean | null;
  fieldMeta: Record<string, FieldMeta>;
  observedAt: Date | null;
};

export type ScoreInput = {
  fees: FeeInput[];
  licenses: { status: "verified" | "pending" | "unverified" }[];
  review: { approvedCount: number; approvedAvg: number | null };
  platformStatus: "active" | "suspended" | "closed";
  now?: Date;
};

export type AxisResult = {
  key: AxisKey;
  label: string;
  weight: number;
  /** محور غیرفعال نه در مجموع می‌آید و نه «ناکامل» می‌سازد */
  enabled: boolean;
  /** ۰ تا ۱؛ null یعنی دادهٔ کافی برای این محور نیست */
  ratio: number | null;
  points: number;
  note: string;
};

export type ScoreResult = {
  /** null یعنی هیچ محور فعالی قابل محاسبه نبود */
  total: number | null;
  incomplete: boolean;
  cappedAt75: boolean;
  suppressedByRisk: boolean;
  axes: AxisResult[];
};

const TRUSTED = new Set(["declared", "observed"]);

function trustedField(value: unknown, meta: FieldMeta | undefined): boolean {
  return value !== null && meta !== undefined && TRUSTED.has(meta.confidence);
}

function avg(values: number[]): number {
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function feeCoverageRatio(fees: FeeInput[]): number | null {
  if (fees.length === 0) return null;
  const perRow = fees.map((f) => {
    const trusted = [
      trustedField(f.buyFeePct, f.fieldMeta.buyFeePct),
      trustedField(f.sellFeePct, f.fieldMeta.sellFeePct),
      trustedField(f.minBuyToman, f.fieldMeta.minBuyToman),
      trustedField(f.withdrawalFeeToman, f.fieldMeta.withdrawalFeeToman),
      trustedField(f.physicalDelivery, f.fieldMeta.physicalDelivery),
    ];
    return trusted.filter(Boolean).length / trusted.length;
  });
  return avg(perRow);
}

function makeAxis(
  key: AxisKey,
  partial: Omit<AxisResult, "key" | "label" | "weight">,
): AxisResult {
  return {
    key,
    label: AXIS_LABELS[key],
    weight: AXIS_WEIGHTS[key],
    ...partial,
  };
}

function axisFeeTransparency(input: ScoreInput): AxisResult {
  const ratio = feeCoverageRatio(input.fees);
  if (ratio === null) {
    return makeAxis("feeTransparency", {
      enabled: true,
      ratio: null,
      points: 0,
      note: "هیچ دادهٔ کارمزدی ثبت نشده است",
    });
  }
  return makeAxis("feeTransparency", {
    enabled: true,
    ratio,
    points: Math.round(ratio * AXIS_WEIGHTS.feeTransparency),
    note: `سهم فیلدهای کارمزد دارای منبع معتبر: ${Math.round(ratio * 100)}٪`,
  });
}

function axisLegitimacy(input: ScoreInput): AxisResult {
  if (input.licenses.length === 0) {
    return makeAxis("legitimacy", {
      enabled: true,
      ratio: null,
      points: 0,
      note: "هیچ مجوزی ثبت نشده است",
    });
  }
  if (input.licenses.some((l) => l.status === "verified")) {
    return makeAxis("legitimacy", {
      enabled: true,
      ratio: 1,
      points: AXIS_WEIGHTS.legitimacy,
      note: "حداقل یک مجوز راستی‌آزمایی‌شده",
    });
  }
  if (input.licenses.some((l) => l.status === "pending")) {
    return makeAxis("legitimacy", {
      enabled: true,
      ratio: 0.4,
      points: Math.round(0.4 * AXIS_WEIGHTS.legitimacy),
      note: "مجوز در انتظار راستی‌آزمایی است",
    });
  }
  return makeAxis("legitimacy", {
    enabled: true,
    ratio: 0,
    points: 0,
    note: "هیچ مجوز تأییدشده‌ای وجود ندارد",
  });
}

function axisUserExperience(input: ScoreInput): AxisResult {
  const { approvedCount, approvedAvg } = input.review;
  if (approvedCount < MIN_REVIEWS || approvedAvg === null) {
    return makeAxis("userExperience", {
      enabled: true,
      ratio: null,
      points: 0,
      note: `به حد نصاب نظرات نرسیده (حداقل ${MIN_REVIEWS} نظر تأییدشده)`,
    });
  }
  /* سقف اثر نظرات کاربران روی امتیاز کل: ۱۰ امتیاز از ۱۰۰ */
  const points = Math.round((approvedAvg / 5) * REVIEW_MAX_POINTS);
  return makeAxis("userExperience", {
    enabled: true,
    ratio: points / AXIS_WEIGHTS.userExperience,
    points,
    note: `${approvedCount} نظر تأییدشده با میانگین ${approvedAvg.toFixed(1)} از ۵`,
  });
}

function axisSettlement(input: ScoreInput): AxisResult {
  const signals: number[] = [];
  for (const f of input.fees) {
    if (f.physicalDelivery !== null) signals.push(f.physicalDelivery ? 1 : 0.3);
    if (f.withdrawalFeeToman !== null) signals.push(1);
  }
  if (signals.length === 0) {
    return makeAxis("settlement", {
      enabled: true,
      ratio: null,
      points: 0,
      note: "دادهٔ تسویه و تحویل ثبت نشده است",
    });
  }
  const ratio = avg(signals);
  return makeAxis("settlement", {
    enabled: true,
    ratio,
    points: Math.round(ratio * AXIS_WEIGHTS.settlement),
    note: "بر اساس دادهٔ تحویل فیزیکی و کارمزد برداشت",
  });
}

/** محور پشتیبانی تا اتصال مدل دادهٔ پشتیبانی غیرفعال است */
function axisSupport(): AxisResult {
  return makeAxis("support", {
    enabled: false,
    ratio: null,
    points: 0,
    note: "این محور با اتصال دادهٔ پشتیبانی فعال می‌شود",
  });
}

function axisDataTransparency(input: ScoreInput): AxisResult {
  const feeCov = feeCoverageRatio(input.fees);
  if (feeCov === null && input.licenses.length === 0) {
    return makeAxis("dataTransparency", {
      enabled: true,
      ratio: null,
      points: 0,
      note: "داده‌ای برای ارزیابی شفافیت نیست",
    });
  }
  const latest = input.fees
    .map((f) => f.observedAt)
    .filter((d): d is Date => d !== null)
    .sort((a, b) => b.getTime() - a.getTime())[0];
  const now = input.now ?? new Date();
  const fresh =
    latest !== undefined && now.getTime() - latest.getTime() <= 30 * 86_400_000
      ? 1
      : 0;
  const ratio =
    0.5 * (feeCov ?? 0) +
    0.3 * (input.licenses.length > 0 ? 1 : 0) +
    0.2 * fresh;
  return makeAxis("dataTransparency", {
    enabled: true,
    ratio,
    points: Math.round(ratio * AXIS_WEIGHTS.dataTransparency),
    note: fresh === 1 ? "داده تازه است" : "داده به تازه‌سازی نیاز دارد",
  });
}

export function computeScore(input: ScoreInput): ScoreResult {
  const axes = [
    axisFeeTransparency(input),
    axisLegitimacy(input),
    axisUserExperience(input),
    axisSettlement(input),
    axisSupport(),
    axisDataTransparency(input),
  ];
  const enabled = axes.filter((a) => a.enabled);
  const anyComputable = enabled.some((a) => a.ratio !== null);
  const suppressedByRisk = input.platformStatus !== "active";

  if (!anyComputable) {
    return {
      total: null,
      incomplete: true,
      cappedAt75: false,
      suppressedByRisk,
      axes,
    };
  }

  const incomplete = enabled.some((a) => a.ratio === null);
  const weightSum = enabled.reduce((s, a) => s + a.weight, 0);
  const pointSum = enabled.reduce((s, a) => s + a.points, 0);
  let total = Math.round((pointSum / weightSum) * 100);
  let cappedAt75 = false;

  if (incomplete && total > INCOMPLETE_CAP) {
    total = INCOMPLETE_CAP;
    cappedAt75 = true;
  }
  if (suppressedByRisk) {
    total = Math.min(total, RISK_CAP);
  }

  return { total, incomplete, cappedAt75, suppressedByRisk, axes };
}
