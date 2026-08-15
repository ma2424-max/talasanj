type Props = {
  variant?: "affiliate" | "general";
};

const TEXTS = {
  affiliate:
    "برخی لینک‌های این صفحه ممکن است لینک همکاری باشند؛ این موضوع هیچ اثری بر امتیاز و ترتیب پلتفرم‌ها ندارد.",
  general:
    "طلاسنج توصیهٔ سرمایه‌گذاری ارائه نمی‌دهد؛ مسئولیت تصمیم نهایی با کاربر است.",
} as const;

/** بنر افشای درآمد/دیسکلیمر — الزامی در صفحات دارای لینک خروجی پولی */
export function DisclosureBanner({ variant = "general" }: Props) {
  return (
    <p className="rounded-xl border border-muted/20 bg-bg-surface px-4 py-3 text-xs leading-6 text-muted">
      {TEXTS[variant]}{" "}
      <a
        href="/advertising-disclosure/"
        className="underline decoration-dotted underline-offset-4 hover:text-gold"
      >
        مدل درآمدی ما
      </a>
    </p>
  );
}
