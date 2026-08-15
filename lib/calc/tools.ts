/** توابع خالص ابزارهای مالی S8؛ هیچ قیمت یا مشخصات سکه‌ای حدس زده نمی‌شود. */
const KARAT_18_PURITY = 18 / 24;

function positive(value: number, message: string) {
  if (!Number.isFinite(value) || value <= 0) throw new Error(message);
}

function percent(value: number, message: string, allowHundred = false) {
  if (
    !Number.isFinite(value) ||
    value < 0 ||
    (allowHundred ? value > 100 : value >= 100)
  ) {
    throw new Error(message);
  }
}

function vatMultiplier(vatRatePct: number | null) {
  if (vatRatePct === null) return 1;
  percent(vatRatePct, "نرخ مالیات نامعتبر است", true);
  return 1 + vatRatePct / 100;
}

export type CoinBubbleResult = {
  intrinsicToman: number;
  bubbleToman: number;
  bubblePct: number;
  equivalentGram18: number;
};

export function computeCoinBubble(input: {
  coinPriceToman: number;
  gram18PriceToman: number;
  weightGrams: number;
  purityPerThousand: number;
}): CoinBubbleResult {
  positive(input.coinPriceToman, "قیمت سکه نامعتبر است");
  positive(input.gram18PriceToman, "قیمت مرجع هر گرم طلای ۱۸ عیار نامعتبر است");
  positive(input.weightGrams, "وزن سکه نامعتبر است");
  if (
    !Number.isFinite(input.purityPerThousand) ||
    input.purityPerThousand <= 0 ||
    input.purityPerThousand > 1000
  ) {
    throw new Error("عیار سکه نامعتبر است");
  }
  const equivalentGram18 =
    (input.weightGrams * (input.purityPerThousand / 1000)) / KARAT_18_PURITY;
  const intrinsicToman = Math.round(equivalentGram18 * input.gram18PriceToman);
  const bubbleToman = input.coinPriceToman - intrinsicToman;
  return {
    intrinsicToman,
    bubbleToman,
    bubblePct: (bubbleToman / intrinsicToman) * 100,
    equivalentGram18,
  };
}

export type SavingsPlanResult = {
  totalPaidToman: number;
  totalFeesToman: number;
  totalGoldGrams: number;
  avgCostPerGramToman: number;
  monthlyNetToman: number;
  vatIncluded: boolean;
};

export function computeSavingsPlan(input: {
  monthlyToman: number;
  months: number;
  buyFeePct: number;
  goldPricePerGramToman: number;
  vatRatePct: number | null;
}): SavingsPlanResult {
  positive(input.monthlyToman, "مبلغ ماهانه نامعتبر است");
  if (
    !Number.isInteger(input.months) ||
    input.months <= 0 ||
    input.months > 600
  ) {
    throw new Error("تعداد ماه نامعتبر است");
  }
  positive(input.goldPricePerGramToman, "قیمت مرجع هر گرم طلا نامعتبر است");
  percent(input.buyFeePct, "کارمزد خرید نامعتبر است");
  const fee = Math.round((input.monthlyToman * input.buyFeePct) / 100);
  const vat = Math.round(fee * (vatMultiplier(input.vatRatePct) - 1));
  const monthlyNetToman = input.monthlyToman - fee - vat;
  if (monthlyNetToman <= 0) throw new Error("کارمزد از مبلغ ماهانه بیشتر است");
  const totalPaidToman = input.monthlyToman * input.months;
  const totalFeesToman = (fee + vat) * input.months;
  const totalGoldGrams =
    (monthlyNetToman / input.goldPricePerGramToman) * input.months;
  return {
    totalPaidToman,
    totalFeesToman,
    totalGoldGrams,
    avgCostPerGramToman: Math.round(totalPaidToman / totalGoldGrams),
    monthlyNetToman,
    vatIncluded: input.vatRatePct !== null,
  };
}

export type EjratBreakdown = {
  goldValueToman: number;
  ejratToman: number;
  sellerProfitToman: number;
  vatToman: number;
  finalPriceToman: number;
  effectiveMarkupPct: number;
  vatIncluded: boolean;
};

export function computeEjratBreakdown(input: {
  weightGrams: number;
  gram18PriceToman: number;
  ejratPerGramToman: number;
  sellerProfitPct: number;
  vatRatePct: number | null;
}): EjratBreakdown {
  positive(input.weightGrams, "وزن نامعتبر است");
  positive(input.gram18PriceToman, "قیمت مرجع هر گرم طلای ۱۸ عیار نامعتبر است");
  if (
    !Number.isFinite(input.ejratPerGramToman) ||
    input.ejratPerGramToman < 0
  ) {
    throw new Error("اجرت ساخت نامعتبر است");
  }
  percent(input.sellerProfitPct, "سود فروشنده نامعتبر است", true);
  vatMultiplier(input.vatRatePct);
  const goldValueToman = Math.round(input.weightGrams * input.gram18PriceToman);
  const ejratToman = Math.round(input.weightGrams * input.ejratPerGramToman);
  const sellerProfitToman = Math.round(
    ((goldValueToman + ejratToman) * input.sellerProfitPct) / 100,
  );
  const vatToman =
    input.vatRatePct === null
      ? 0
      : Math.round(((ejratToman + sellerProfitToman) * input.vatRatePct) / 100);
  const finalPriceToman =
    goldValueToman + ejratToman + sellerProfitToman + vatToman;
  return {
    goldValueToman,
    ejratToman,
    sellerProfitToman,
    vatToman,
    finalPriceToman,
    effectiveMarkupPct:
      ((finalPriceToman - goldValueToman) / goldValueToman) * 100,
    vatIncluded: input.vatRatePct !== null,
  };
}

export type BreakEvenResult = {
  effectiveBuyFeePct: number;
  effectiveSellFeePct: number;
  nominalRoundTripPct: number;
  breakEvenPct: number;
  vatIncluded: boolean;
};

export function computeBreakEven(input: {
  buyFeePct: number;
  sellFeePct: number;
  vatRatePct: number | null;
}): BreakEvenResult {
  percent(input.buyFeePct, "کارمزد خرید نامعتبر است");
  percent(input.sellFeePct, "کارمزد فروش نامعتبر است");
  const multiplier = vatMultiplier(input.vatRatePct);
  const effectiveBuyFeePct = input.buyFeePct * multiplier;
  const effectiveSellFeePct = input.sellFeePct * multiplier;
  percent(effectiveBuyFeePct, "کارمزد مؤثر خرید نامعتبر است");
  percent(effectiveSellFeePct, "کارمزد مؤثر فروش نامعتبر است");
  const buyFactor = 1 - effectiveBuyFeePct / 100;
  const sellFactor = 1 - effectiveSellFeePct / 100;
  return {
    effectiveBuyFeePct,
    effectiveSellFeePct,
    nominalRoundTripPct: effectiveBuyFeePct + effectiveSellFeePct,
    breakEvenPct: (1 / (buyFactor * sellFactor) - 1) * 100,
    vatIncluded: input.vatRatePct !== null,
  };
}
