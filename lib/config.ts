import assumptions from "@/data/config/assumptions.json";

/**
 * نرخ مالیات ارزش افزوده فقط از فایل پیکربندی خوانده می‌شود — هاردکد ممنوع.
 * null یعنی نرخ هنوز از سازمان امور مالیاتی تأیید نشده (§۸.۲ سند ساخت).
 */
export function getVatRatePct(): number | null {
  return assumptions.vat.ratePct;
}

export const VAT_NOTE: string = assumptions.vat.note;

/** مبالغ مرجع برای نمودارهای هزینهٔ مقایسه — از پیکربندی */
export function getReferenceAmounts(): number[] {
  return assumptions.referenceAmountsToman;
}
