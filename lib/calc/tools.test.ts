import { describe, expect, it } from "vitest";
import {
  computeBreakEven,
  computeCoinBubble,
  computeEjratBreakdown,
  computeSavingsPlan,
} from "./tools";
import {
  filterMethodsByPriority,
  METHOD_COMPARISONS,
} from "../content/method-comparison";

const coinBase = {
  coinPriceToman: 110_000_000,
  gram18PriceToman: 10_000_000,
  weightGrams: 8.133,
  purityPerThousand: 900,
};

describe("حباب‌سنج سکه — تست‌های طلایی", () => {
  it("۱. حباب مثبت", () => {
    const r = computeCoinBubble(coinBase);
    expect(r.equivalentGram18).toBeCloseTo(9.7596, 6);
    expect(r.intrinsicToman).toBe(97_596_000);
    expect(r.bubbleToman).toBe(12_404_000);
  });
  it("۲. حباب صفر", () => {
    const r = computeCoinBubble({ ...coinBase, coinPriceToman: 97_596_000 });
    expect(r.bubbleToman).toBe(0);
    expect(r.bubblePct).toBe(0);
  });
  it("۳. حباب منفی", () => {
    const r = computeCoinBubble({ ...coinBase, coinPriceToman: 90_000_000 });
    expect(r.bubbleToman).toBe(-7_596_000);
    expect(r.bubblePct).toBeLessThan(0);
  });
  it("۴. تبدیل عیار ۷۵۰", () => {
    const r = computeCoinBubble({
      ...coinBase,
      coinPriceToman: 10_000_000,
      weightGrams: 1,
      purityPerThousand: 750,
    });
    expect(r.equivalentGram18).toBe(1);
    expect(r.intrinsicToman).toBe(10_000_000);
  });
  it("۵. عیار اعشاری", () => {
    const r = computeCoinBubble({
      coinPriceToman: 16_000_000,
      gram18PriceToman: 12_000_000,
      weightGrams: 1,
      purityPerThousand: 999,
    });
    expect(r.equivalentGram18).toBeCloseTo(1.332, 6);
    expect(r.bubbleToman).toBe(16_000);
  });
  it("۶. ورودی نامعتبر", () => {
    expect(() => computeCoinBubble({ ...coinBase, coinPriceToman: 0 })).toThrow(
      /قیمت سکه/,
    );
    expect(() => computeCoinBubble({ ...coinBase, weightGrams: -1 })).toThrow(
      /وزن/,
    );
    expect(() =>
      computeCoinBubble({ ...coinBase, purityPerThousand: 1001 }),
    ).toThrow(/عیار/);
  });
});

const savingBase = {
  monthlyToman: 1_000_000,
  months: 10,
  buyFeePct: 0.5,
  goldPricePerGramToman: 10_000_000,
  vatRatePct: null,
};

describe("سناریوی پس‌انداز — تست‌های طلایی", () => {
  it("۱. محاسبهٔ پایه", () => {
    const r = computeSavingsPlan(savingBase);
    expect(r.totalPaidToman).toBe(10_000_000);
    expect(r.totalFeesToman).toBe(50_000);
    expect(r.totalGoldGrams).toBeCloseTo(0.995, 8);
  });
  it("۲. کارمزد صفر", () => {
    const r = computeSavingsPlan({ ...savingBase, months: 12, buyFeePct: 0 });
    expect(r.totalGoldGrams).toBeCloseTo(1.2, 8);
    expect(r.avgCostPerGramToman).toBe(10_000_000);
  });
  it("۳. مالیات فقط روی کارمزد", () => {
    const r = computeSavingsPlan({
      ...savingBase,
      months: 1,
      buyFeePct: 1,
      vatRatePct: 9,
    });
    expect(r.totalFeesToman).toBe(10_900);
    expect(r.monthlyNetToman).toBe(989_100);
  });
  it("۴. تعداد ماه خطی است", () => {
    const one = computeSavingsPlan({ ...savingBase, months: 1 });
    const six = computeSavingsPlan({ ...savingBase, months: 6 });
    expect(six.totalGoldGrams).toBeCloseTo(one.totalGoldGrams * 6, 8);
  });
  it("۵. دو برابر قیمت یعنی نصف طلا", () => {
    const low = computeSavingsPlan({
      ...savingBase,
      buyFeePct: 0,
      goldPricePerGramToman: 5_000_000,
    });
    const high = computeSavingsPlan({ ...savingBase, buyFeePct: 0 });
    expect(high.totalGoldGrams).toBeCloseTo(low.totalGoldGrams / 2, 8);
  });
  it("۶. ورودی نامعتبر", () => {
    expect(() =>
      computeSavingsPlan({ ...savingBase, monthlyToman: 0 }),
    ).toThrow(/مبلغ/);
    expect(() => computeSavingsPlan({ ...savingBase, months: 0 })).toThrow(
      /ماه/,
    );
    expect(() => computeSavingsPlan({ ...savingBase, buyFeePct: 100 })).toThrow(
      /کارمزد/,
    );
  });
});

const ejratBase = {
  weightGrams: 2,
  gram18PriceToman: 10_000_000,
  ejratPerGramToman: 500_000,
  sellerProfitPct: 7,
  vatRatePct: 9,
};

describe("اجرت، سود و مالیات — تست‌های طلایی", () => {
  it("۱. تفکیک کامل", () => {
    const r = computeEjratBreakdown(ejratBase);
    expect(r.goldValueToman).toBe(20_000_000);
    expect(r.ejratToman).toBe(1_000_000);
    expect(r.sellerProfitToman).toBe(1_470_000);
    expect(r.vatToman).toBe(222_300);
    expect(r.finalPriceToman).toBe(22_692_300);
  });
  it("۲. بدون اجرت و سود", () => {
    const r = computeEjratBreakdown({
      ...ejratBase,
      weightGrams: 1,
      ejratPerGramToman: 0,
      sellerProfitPct: 0,
    });
    expect(r.finalPriceToman).toBe(10_000_000);
    expect(r.vatToman).toBe(0);
  });
  it("۳. مالیات تأییدنشده", () => {
    const r = computeEjratBreakdown({
      ...ejratBase,
      weightGrams: 1,
      ejratPerGramToman: 1_000_000,
      sellerProfitPct: 5,
      vatRatePct: null,
    });
    expect(r.vatToman).toBe(0);
    expect(r.finalPriceToman).toBe(11_550_000);
  });
  it("۴. وزن اعشاری", () => {
    const r = computeEjratBreakdown({
      ...ejratBase,
      weightGrams: 0.25,
      gram18PriceToman: 8_000_000,
      ejratPerGramToman: 400_000,
      sellerProfitPct: 0,
      vatRatePct: null,
    });
    expect(r.goldValueToman).toBe(2_000_000);
    expect(r.finalPriceToman).toBe(2_100_000);
  });
  it("۵. اصل طلا معاف است", () => {
    const r = computeEjratBreakdown({
      ...ejratBase,
      weightGrams: 1,
      gram18PriceToman: 100_000_000,
      ejratPerGramToman: 1_000_000,
      sellerProfitPct: 0,
      vatRatePct: 10,
    });
    expect(r.vatToman).toBe(100_000);
  });
  it("۶. ورودی نامعتبر", () => {
    expect(() =>
      computeEjratBreakdown({ ...ejratBase, weightGrams: 0 }),
    ).toThrow(/وزن/);
    expect(() =>
      computeEjratBreakdown({ ...ejratBase, ejratPerGramToman: -1 }),
    ).toThrow(/اجرت/);
    expect(() =>
      computeEjratBreakdown({ ...ejratBase, sellerProfitPct: 101 }),
    ).toThrow(/سود/);
  });
});

describe("نقطهٔ سر‌به‌سر — تست‌های طلایی", () => {
  it("۱. بدون کارمزد", () =>
    expect(
      computeBreakEven({ buyFeePct: 0, sellFeePct: 0, vatRatePct: null })
        .breakEvenPct,
    ).toBe(0));
  it("۲. تک‌کارمزد", () =>
    expect(
      computeBreakEven({ buyFeePct: 1, sellFeePct: 0, vatRatePct: null })
        .breakEvenPct,
    ).toBeCloseTo(1.010101, 5));
  it("۳. فرمول ترکیبی", () => {
    const r = computeBreakEven({
      buyFeePct: 0.5,
      sellFeePct: 0.7,
      vatRatePct: null,
    });
    expect(r.breakEvenPct).toBeCloseTo((1 / (0.995 * 0.993) - 1) * 100, 8);
  });
  it("۴. مالیات کارمزد", () => {
    const r = computeBreakEven({
      buyFeePct: 0.5,
      sellFeePct: 0.7,
      vatRatePct: 9,
    });
    expect(r.effectiveBuyFeePct).toBeCloseTo(0.545, 8);
    expect(r.effectiveSellFeePct).toBeCloseTo(0.763, 8);
  });
  it("۵. تقارن خرید و فروش", () => {
    const a = computeBreakEven({
      buyFeePct: 0.4,
      sellFeePct: 0.8,
      vatRatePct: null,
    });
    const b = computeBreakEven({
      buyFeePct: 0.8,
      sellFeePct: 0.4,
      vatRatePct: null,
    });
    expect(a.breakEvenPct).toBeCloseTo(b.breakEvenPct, 12);
  });
  it("۶. ورودی نامعتبر", () => {
    expect(() =>
      computeBreakEven({ buyFeePct: -1, sellFeePct: 0, vatRatePct: null }),
    ).toThrow(/خرید/);
    expect(() =>
      computeBreakEven({ buyFeePct: 0, sellFeePct: 100, vatRatePct: null }),
    ).toThrow(/فروش/);
    expect(() =>
      computeBreakEven({ buyFeePct: 1, sellFeePct: 1, vatRatePct: 101 }),
    ).toThrow(/مالیات/);
  });
});

describe("مقایسه‌گر کیفی روش‌ها", () => {
  it("۱. هفت روش یکتا", () => {
    expect(METHOD_COMPARISONS).toHaveLength(7);
    expect(new Set(METHOD_COMPARISONS.map((m) => m.slug)).size).toBe(7);
  });
  it("۲. فیلتر شروع کم", () =>
    expect(
      filterMethodsByPriority("small").every((m) =>
        m.priorities.includes("small"),
      ),
    ).toBe(true));
  it("۳. فیلتر بورسی", () =>
    expect(filterMethodsByPriority("bourse").map((m) => m.slug)).toEqual([
      "gold-fund",
      "commodity-certificate",
    ]));
  it("۴. کپی مستقل همه", () => {
    const all = filterMethodsByPriority("all");
    expect(all).toEqual(METHOD_COMPARISONS);
    expect(all).not.toBe(METHOD_COMPARISONS);
  });
});
