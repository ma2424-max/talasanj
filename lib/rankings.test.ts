import { describe, expect, it } from "vitest";
import {
  rankGoldBar,
  rankLicensed,
  rankLowestFee,
  rankPhysicalDelivery,
  rankSmallSavings,
  RANKERS,
  type RankableEntry,
} from "./rankings";

function entry(
  partial: Partial<RankableEntry> & { slug: string },
): RankableEntry {
  return {
    nameFa: `پلتفرم ${partial.slug}`,
    status: "active",
    methods: ["molten-gold"],
    buyFeePct: null,
    sellFeePct: null,
    minBuyToman: null,
    physicalDelivery: null,
    withdrawalFeeToman: null,
    hasVerifiedLicense: false,
    scoreTotal: null,
    settlementRatio: null,
    latestDataAt: null,
    ...partial,
  };
}

const sample: RankableEntry[] = [
  entry({
    slug: "cheap",
    buyFeePct: 0.3,
    minBuyToman: 500000,
    physicalDelivery: true,
    withdrawalFeeToman: 10000,
    hasVerifiedLicense: true,
    scoreTotal: 80,
    settlementRatio: 0.9,
  }),
  entry({
    slug: "mid",
    buyFeePct: 0.5,
    minBuyToman: 100000,
    physicalDelivery: true,
    hasVerifiedLicense: true,
    scoreTotal: 70,
    settlementRatio: 0.5,
  }),
  entry({
    slug: "pricey",
    buyFeePct: 1,
    minBuyToman: 100000,
    scoreTotal: 60,
    methods: ["molten-gold", "gold-bar"],
  }),
  entry({
    slug: "suspended-one",
    buyFeePct: 0.1,
    hasVerifiedLicense: true,
    scoreTotal: 95,
    status: "suspended",
  }),
  entry({ slug: "unknown", buyFeePct: null, scoreTotal: null }),
];

describe("موتور رتبه‌بندی برترین‌ها — تست‌های طلایی", () => {
  it("۱. کمترین کارمزد: صعودی مرتب می‌شود، نامشخص و متوقف حذف می‌شوند", () => {
    const r = rankLowestFee(sample);
    expect(r.map((e) => e.slug)).toEqual(["cheap", "mid", "pricey"]);
  });

  it("۲. تحویل فیزیکی: فقط داراها، بر اساس محور تسویه", () => {
    const r = rankPhysicalDelivery(sample);
    expect(r.map((e) => e.slug)).toEqual(["cheap", "mid"]);
  });

  it("۳. خرید جزئی: حداقل خرید کمتر اول؛ مساوی بودن با کارمزد حل می‌شود", () => {
    const r = rankSmallSavings(sample);
    expect(r.map((e) => e.slug)).toEqual(["mid", "pricey", "cheap"]);
  });

  it("۴. دارای مجوز: فقط راستی‌آزمایی‌شده‌ها، بر اساس امتیاز", () => {
    const r = rankLicensed(sample);
    expect(r.map((e) => e.slug)).toEqual(["cheap", "mid"]);
  });

  it("۵. شمش: فقط ارائه‌دهندگان شمش", () => {
    const r = rankGoldBar(sample);
    expect(r.map((e) => e.slug)).toEqual(["pricey"]);
  });

  it("۶. ورودی خالی برای همهٔ معیارها خروجی خالی می‌دهد", () => {
    for (const ranker of Object.values(RANKERS)) {
      expect(ranker([])).toEqual([]);
    }
  });
});
