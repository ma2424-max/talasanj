const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

/** تبدیل ارقام لاتین به فارسی برای نمایش */
export function toFaDigits(value: number | string): string {
  return String(value).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

/** ۱۲۳۴۵۶۷ ← «۱٬۲۳۴٬۵۶۷ تومان» */
export function formatToman(value: number): string {
  const grouped = new Intl.NumberFormat("en-US").format(value);
  return `${toFaDigits(grouped)} تومان`;
}

/** 0.5 یا "0.5" ← «۰٫۵٪» و null ← «نامشخص» */
export function formatPct(value: number | string | null): string {
  if (value === null || value === undefined || value === "") return "نامشخص";
  const n = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(n)) return "نامشخص";
  return `${toFaDigits(String(n).replace(".", "٫"))}٪`;
}

/** ۴٫۹۷۵ گرم */
export function formatGrams(value: number): string {
  return `${toFaDigits(value.toFixed(3).replace(".", "٫"))} گرم`;
}

/** تفاوت روز از یک تاریخ ISO تا الان */
export function daysSince(isoDate: string, now = new Date()): number {
  const then = new Date(isoDate).getTime();
  return Math.floor((now.getTime() - then) / 86_400_000);
}

/** تاریخ شمسی خوانا برای نمایش */
export function formatFaDate(isoDate: string): string {
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(
    new Date(isoDate),
  );
}
