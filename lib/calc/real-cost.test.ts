import { describe, expect, it } from "vitest";
import { computeRealCost, rankPlatforms } from "./real-cost";

describe("محاسبه‌گر هزینهٔ واقعی — تست‌های طلایی", () => {
  it("۱. محاسبهٔ پایه بدون مالیات", () => {
    const r = computeRealCost({
      amountToman: 50_000_000,
      goldPricePerGramToman: 10_000_000,
      buyFeePct: 0.5,
      vatRatePct: null,
    });
    expect(r.feeToman).toBe(250_000);
    expect(r.vatToman).toBe(0);
    expect(r.vatIncluded).toBe(false);
    expect(r.netGoldToman).toBe(49_750_000);
    expect(r.goldGrams).toBeCloseTo(4.975);
    expect(r.effectiveFeePct).toBeCloseTo(0.5);
  });

  it("۲. مالیات فقط به کارمزد تعلق می‌گیرد، نه به اصل طلا", () => {
    const r = computeRealCost({
      amountToman: 50_000_000,
      goldPricePerGramToman: 10_000_000,
      buyFeePct: 0.5,
      vatRatePct: 9,
    });
    expect(r.vatToman).toBe(22_500);
    expect(r.netGoldToman).toBe(50_000_000 - 250_000 - 22_500);
    expect(r.vatIncluded).toBe(true);
  });

  it("۳. کارمزد صفر یعنی کل مبلغ تبدیل به طلا می‌شود", () => {
    const r = computeRealCost({
      amountToman: 50_000_000,
      goldPricePerGramToman: 10_000_000,
      buyFeePct: 0,
      vatRatePct: 9,
    });
    expect(r.feeToman).toBe(0);
    expect(r.vatToman).toBe(0);
    expect(r.goldGrams).toBe(5);
  });

  it("۴. ورودی نامعتبر خطا می‌دهد", () => {
    expect(() =>
      computeRealCost({
        amountToman: 0,
        goldPricePerGramToman: 10_000_000,
        buyFeePct: 0.5,
        vatRatePct: null,
      }),
    ).toThrow("مبلغ نامعتبر است");
    expect(() =>
      computeRealCost({
        amountToman: 50_000_000,
        goldPricePerGramToman: -1,
        buyFeePct: 0.5,
        vatRatePct: null,
      }),
    ).toThrow("قیمت مرجع نامعتبر است");
  });

  it("۵. رتبه‌بندی: ارزان‌ترین اول و پلتفرم بدون داده در فهرست نامشخص", () => {
    const { ranked, unknown } = rankPlatforms(
      [
        { slug: "b", nameFa: "پلتفرم ب", buyFeePct: 1 },
        { slug: "a", nameFa: "پلتفرم الف", buyFeePct: 0.5 },
        { slug: "c", nameFa: "پلتفرم ج", buyFeePct: null },
      ],
      50_000_000,
      10_000_000,
      null,
    );
    expect(ranked.map((r) => r.slug)).toEqual(["a", "b"]);
    expect(unknown.map((u) => u.slug)).toEqual(["c"]);
    expect(ranked[0].goldGrams).toBeGreaterThan(ranked[1].goldGrams);
  });

  it("۶. کارمزد بالای غیرمعمول هم درست محاسبه می‌شود", () => {
    const r = computeRealCost({
      amountToman: 50_000_000,
      goldPricePerGramToman: 10_000_000,
      buyFeePct: 10,
      vatRatePct: null,
    });
    expect(r.feeToman).toBe(5_000_000);
    expect(r.netGoldToman).toBe(45_000_000);
    expect(r.goldGrams).toBeCloseTo(4.5);
    expect(r.effectiveFeePct).toBeCloseTo(10);
  });
});
