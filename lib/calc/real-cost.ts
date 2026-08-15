/**
 * محاسبه‌گر هزینهٔ واقعی خرید طلا — ابزار شاخص طلاسنج (§۸.۲ سند ساخت).
 * تابع خالص، بدون وابستگی جانبی، صددرصد تست‌پذیر.
 *
 * فرمول: مبلغ خالص طلا = مبلغ ورودی − کارمزد خرید − مالیات بر کارمزد
 * نکتهٔ مالیات: فقط به کارمزد/حق‌العمل تعلق می‌گیرد (اصل طلا معاف است)
 * و نرخش فقط از data/config/assumptions.json می‌آید؛ تا تأیید رسمی null است.
 */

export type RealCostInput = {
  amountToman: number;
  goldPricePerGramToman: number;
  /** null یعنی کارمزد این پلتفرم نامشخص است */
  buyFeePct: number | null;
  /** null یعنی نرخ مالیات هنوز تأیید نشده — مالیات صفر محاسبه و هشدار داده می‌شود */
  vatRatePct: number | null;
};

export type RealCostResult = {
  feeToman: number;
  vatToman: number;
  netGoldToman: number;
  goldGrams: number;
  effectiveFeePct: number;
  vatIncluded: boolean;
  feeKnown: boolean;
};

export function computeRealCost(input: RealCostInput): RealCostResult {
  if (!Number.isFinite(input.amountToman) || input.amountToman <= 0) {
    throw new Error("مبلغ نامعتبر است");
  }
  if (
    !Number.isFinite(input.goldPricePerGramToman) ||
    input.goldPricePerGramToman <= 0
  ) {
    throw new Error("قیمت مرجع نامعتبر است");
  }

  const feePct = input.buyFeePct ?? 0;
  const feeToman = Math.round((input.amountToman * feePct) / 100);
  const vatIncluded = input.vatRatePct !== null;
  const vatToman = vatIncluded
    ? Math.round((feeToman * (input.vatRatePct as number)) / 100)
    : 0;
  const netGoldToman = input.amountToman - feeToman - vatToman;
  const goldGrams = netGoldToman / input.goldPricePerGramToman;
  const effectiveFeePct = ((feeToman + vatToman) / input.amountToman) * 100;

  return {
    feeToman,
    vatToman,
    netGoldToman,
    goldGrams,
    effectiveFeePct,
    vatIncluded,
    feeKnown: input.buyFeePct !== null,
  };
}

export type RankedPlatform = RealCostResult & {
  slug: string;
  nameFa: string;
};

/** رتبه‌بندی پلتفرم‌ها بر اساس بیشترین طلای دریافتی؛ نامشخص‌ها همیشه آخر */
export function rankPlatforms(
  items: { slug: string; nameFa: string; buyFeePct: number | null }[],
  amountToman: number,
  goldPricePerGramToman: number,
  vatRatePct: number | null,
): { ranked: RankedPlatform[]; unknown: { slug: string; nameFa: string }[] } {
  const ranked: RankedPlatform[] = [];
  const unknown: { slug: string; nameFa: string }[] = [];

  for (const item of items) {
    if (item.buyFeePct === null) {
      unknown.push({ slug: item.slug, nameFa: item.nameFa });
      continue;
    }
    ranked.push({
      slug: item.slug,
      nameFa: item.nameFa,
      ...computeRealCost({
        amountToman,
        goldPricePerGramToman,
        buyFeePct: item.buyFeePct,
        vatRatePct,
      }),
    });
  }

  ranked.sort((a, b) => b.goldGrams - a.goldGrams);
  return { ranked, unknown };
}
