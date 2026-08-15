/**
 * موتور رتبه‌بندی صفحات «برترین‌ها» — §۵.۲ سند ساختار.
 * توابع خالص؛ رتبه‌بندی فقط از داده، هرگز دستی یا پولی.
 * پلتفرم‌های غیرفعال (متوقف/تعطیل) از همهٔ فهرست‌ها حذف می‌شوند.
 */

export type RankableEntry = {
  slug: string;
  nameFa: string;
  status: "active" | "suspended" | "closed";
  methods: string[];
  buyFeePct: number | null;
  sellFeePct: number | null;
  minBuyToman: number | null;
  physicalDelivery: boolean | null;
  withdrawalFeeToman: number | null;
  hasVerifiedLicense: boolean;
  scoreTotal: number | null;
  /** نسبت محور تسویه و تحویل از موتور امتیاز (۰ تا ۱) */
  settlementRatio: number | null;
  latestDataAt: string | null;
};

function activeOnly(entries: RankableEntry[]): RankableEntry[] {
  return entries.filter((e) => e.status === "active");
}

function byScoreDesc(a: RankableEntry, b: RankableEntry): number {
  return (b.scoreTotal ?? -1) - (a.scoreTotal ?? -1);
}

/** کمترین کارمزد خرید — مبلغ مرجع ۵ میلیون تومان */
export function rankLowestFee(entries: RankableEntry[]): RankableEntry[] {
  return activeOnly(entries)
    .filter((e) => e.buyFeePct !== null)
    .sort((a, b) => (a.buyFeePct as number) - (b.buyFeePct as number));
}

/** دارای تحویل فیزیکی — مرتب بر اساس محور تسویه و تحویل */
export function rankPhysicalDelivery(
  entries: RankableEntry[],
): RankableEntry[] {
  return activeOnly(entries)
    .filter((e) => e.physicalDelivery === true)
    .sort((a, b) => (b.settlementRatio ?? -1) - (a.settlementRatio ?? -1));
}

/** خرید جزئی و پس‌انداز — حداقل خرید کمتر، بعد کارمزد کمتر */
export function rankSmallSavings(entries: RankableEntry[]): RankableEntry[] {
  return activeOnly(entries)
    .filter((e) => e.minBuyToman !== null)
    .sort((a, b) => {
      const diff = (a.minBuyToman as number) - (b.minBuyToman as number);
      if (diff !== 0) return diff;
      return (a.buyFeePct ?? Infinity) - (b.buyFeePct ?? Infinity);
    });
}

/** دارای مجوز راستی‌آزمایی‌شده — مرتب بر اساس امتیاز */
export function rankLicensed(entries: RankableEntry[]): RankableEntry[] {
  return activeOnly(entries)
    .filter((e) => e.hasVerifiedLicense)
    .sort(byScoreDesc);
}

/** سریع‌ترین تسویه — فعلاً بر اساس سیگنال‌های موجود (برداشت/تحویل) */
export function rankFastestSettlement(
  entries: RankableEntry[],
): RankableEntry[] {
  return activeOnly(entries)
    .filter((e) => e.withdrawalFeeToman !== null || e.physicalDelivery === true)
    .sort((a, b) => (b.settlementRatio ?? -1) - (a.settlementRatio ?? -1));
}

/** مناسب خرید شمش — مرتب بر اساس امتیاز */
export function rankGoldBar(entries: RankableEntry[]): RankableEntry[] {
  return activeOnly(entries)
    .filter((e) => e.methods.includes("gold-bar"))
    .sort(byScoreDesc);
}

export const BEST_CRITERIA_ORDER = [
  "lowest-fee",
  "physical-delivery",
  "small-savings",
  "licensed",
  "fastest-settlement",
  "gold-bar",
] as const;

export type BestCriterion = (typeof BEST_CRITERIA_ORDER)[number];

export const RANKERS: Record<
  BestCriterion,
  (entries: RankableEntry[]) => RankableEntry[]
> = {
  "lowest-fee": rankLowestFee,
  "physical-delivery": rankPhysicalDelivery,
  "small-savings": rankSmallSavings,
  licensed: rankLicensed,
  "fastest-settlement": rankFastestSettlement,
  "gold-bar": rankGoldBar,
};
