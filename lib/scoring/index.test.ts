import { describe, expect, it } from "vitest";
import { computeScore, INCOMPLETE_CAP, MIN_REVIEWS, RISK_CAP } from "./index";
import type { ScoreInput } from "./index";

const trustedMeta = {
  confidence: "declared" as const,
  source: "https://example.com",
  observedAt: "2026-08-01",
};

const fullFee = {
  buyFeePct: "0.5",
  sellFeePct: "0.7",
  minBuyToman: 100000,
  withdrawalFeeToman: 50000,
  physicalDelivery: true,
  observedAt: new Date("2026-08-10"),
  fieldMeta: {
    buyFeePct: trustedMeta,
    sellFeePct: trustedMeta,
    minBuyToman: trustedMeta,
    withdrawalFeeToman: trustedMeta,
    physicalDelivery: trustedMeta,
  },
};

const base: ScoreInput = {
  fees: [fullFee],
  licenses: [{ status: "verified" }],
  review: { approvedCount: 6, approvedAvg: 4.5 },
  platformStatus: "active",
  now: new Date("2026-08-15"),
};

describe("موتور امتیازدهی طلاسنج — تست‌های طلایی", () => {
  it("۱. پلتفرم کامل و معتبر امتیاز بالا و بدون سقف می‌گیرد", () => {
    const r = computeScore(base);
    expect(r.total).not.toBeNull();
    expect(r.total!).toBeGreaterThan(75);
    expect(r.incomplete).toBe(false);
    expect(r.cappedAt75).toBe(false);
  });

  it("۲. بدون هیچ داده‌ای امتیاز null است", () => {
    const r = computeScore({
      ...base,
      fees: [],
      licenses: [],
      review: { approvedCount: 0, approvedAvg: null },
    });
    expect(r.total).toBeNull();
    expect(r.incomplete).toBe(true);
  });

  it("۳. پلتفرم متوقف به سقف ریسک سرکوب می‌شود", () => {
    const r = computeScore({ ...base, platformStatus: "suspended" });
    expect(r.suppressedByRisk).toBe(true);
    expect(r.total!).toBeLessThanOrEqual(RISK_CAP);
  });

  it("۴. مجوز در انتظار راستی‌آزمایی امتیاز میانی می‌گیرد", () => {
    const r = computeScore({ ...base, licenses: [{ status: "pending" }] });
    const axis = r.axes.find((a) => a.key === "legitimacy")!;
    expect(axis.ratio).toBeCloseTo(0.4);
  });

  it("۵. نظرات زیر حد نصاب اثر صفر دارند و صفحه ناکامل محسوب می‌شود", () => {
    const r = computeScore({
      ...base,
      review: { approvedCount: MIN_REVIEWS - 1, approvedAvg: 5 },
    });
    const axis = r.axes.find((a) => a.key === "userExperience")!;
    expect(axis.points).toBe(0);
    expect(r.incomplete).toBe(true);
  });

  it("۶. اثر نظرات کاربران هرگز از ۱۰ امتیاز کل بیشتر نمی‌شود", () => {
    const worst = computeScore({
      ...base,
      review: { approvedCount: 10, approvedAvg: 1 },
    });
    const best = computeScore({
      ...base,
      review: { approvedCount: 10, approvedAvg: 5 },
    });
    expect(best.total! - worst.total!).toBeLessThanOrEqual(10);
  });

  it("۷. پوشش ناکامل داده سقف ۷۵ را اعمال می‌کند", () => {
    const r = computeScore({
      ...base,
      review: { approvedCount: 0, approvedAvg: null },
    });
    expect(r.cappedAt75).toBe(true);
    expect(r.total).toBe(INCOMPLETE_CAP);
  });
});
