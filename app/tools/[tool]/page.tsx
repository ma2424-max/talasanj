import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState, RiskFlag } from "@/components";
import { ToolPageShell } from "@/components/ToolPageShell";
import {
  computeBreakEven,
  computeCoinBubble,
  computeEjratBreakdown,
  computeSavingsPlan,
} from "@/lib/calc/tools";
import { getVatRatePct, VAT_NOTE } from "@/lib/config";
import {
  filterMethodsByPriority,
  type MethodPriority,
} from "@/lib/content/method-comparison";
import { formatGrams, formatPct, formatToman } from "@/lib/format";

type ToolSlug =
  "method-compare" | "coin-bubble" | "savings-plan" | "ejrat" | "break-even";

type Params = Record<string, string | string[] | undefined>;
type PageProps = {
  params: Promise<{ tool: string }>;
  searchParams: Promise<Params>;
};

const META: Record<ToolSlug, { title: string; description: string }> = {
  "method-compare": {
    title: "مقایسه‌گر روش‌های خرید طلا",
    description:
      "هفت روش خرید طلا را با معیارهای یکسان و بدون رتبه‌بندی سرمایه‌گذاری کنار هم ببین.",
  },
  "coin-bubble": {
    title: "حباب‌سنج سکهٔ طلا",
    description:
      "ارزش ذاتی سکه را از وزن، عیار و قیمت طلای ۱۸ عیار حساب کن و حباب را ببین.",
  },
  "savings-plan": {
    title: "محاسبه‌گر طرح پس‌انداز طلا",
    description:
      "اثر مبلغ ماهانه و کارمزد را در یک سناریوی قیمت ثابت محاسبه کن.",
  },
  ejrat: {
    title: "محاسبه‌گر اجرت، سود و مالیات طلا",
    description:
      "قیمت طلای زینتی را به ارزش طلا، اجرت، سود و مالیات مرتبط تفکیک کن.",
  },
  "break-even": {
    title: "محاسبه‌گر نقطهٔ سر‌به‌سر خرید طلا",
    description: "درصد رشد لازم برای جبران دقیق کارمزد خرید و فروش را حساب کن.",
  },
};

const INPUT_CLASS =
  "tnum rounded-lg border border-muted/30 bg-bg-base px-3 py-2 text-sm text-cream";

function isTool(value: string): value is ToolSlug {
  return value in META;
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function complete(values: (string | undefined)[]) {
  return values.every((value) => value !== undefined && value !== "");
}

function message(cause: unknown) {
  return cause instanceof Error ? cause.message : "ورودی نامعتبر است";
}

function Input({
  label,
  name,
  value,
  min,
  max,
  step,
}: {
  label: string;
  name: string;
  value?: string;
  min: number | string;
  max?: number | string;
  step?: number | string;
}) {
  return (
    <label className="flex min-w-44 flex-col gap-1 text-xs text-muted">
      {label}
      <input
        type="number"
        inputMode={step ? "decimal" : "numeric"}
        name={name}
        min={min}
        max={max}
        step={step}
        required
        defaultValue={value}
        className={INPUT_CLASS}
      />
    </label>
  );
}

function Submit({ children }: { children: string }) {
  return (
    <button
      type="submit"
      className="rounded-xl bg-gold px-5 py-2.5 text-sm font-bold text-bg-base"
    >
      {children}
    </button>
  );
}

function ResultGrid({
  title,
  items,
}: {
  title: string;
  items: { label: string; value: string; tone?: string }[];
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl bg-bg-surface p-5">
            <p className="text-xs text-muted">{item.label}</p>
            <p className={`tnum mt-1 text-xl font-bold ${item.tone ?? ""}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Invalid({ body }: { body: string }) {
  return <RiskFlag severity="warning" title="ورودی نامعتبر است" body={body} />;
}

function VatWarning() {
  return (
    <RiskFlag
      severity="info"
      title="مالیات در محاسبه لحاظ نشده"
      body="نرخ مالیات هنوز در پیکربندی طلاسنج تأیید نشده است؛ محاسبه بدون مالیات و همراه این هشدار انجام شد."
    />
  );
}

export function generateStaticParams() {
  return Object.keys(META).map((tool) => ({ tool }));
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const [{ tool }, query] = await Promise.all([params, searchParams]);
  if (!isTool(tool)) return { title: "ابزار پیدا نشد | طلاسنج" };
  return {
    title: `${META[tool].title} | طلاسنج`,
    description: META[tool].description,
    alternates: { canonical: `/tools/${tool}/` },
    robots: Object.keys(query).length
      ? { index: false, follow: true }
      : undefined,
  };
}

function CoinTool({ query }: { query: Params }) {
  const coinPrice = first(query.coinPrice);
  const goldPrice = first(query.goldPrice);
  const weight = first(query.weight);
  const purity = first(query.purity);
  const hasQuery = Object.keys(query).length > 0;
  let result: ReturnType<typeof computeCoinBubble> | null = null;
  let error: string | null = null;
  if (hasQuery) {
    if (!complete([coinPrice, goldPrice, weight, purity]))
      error = "هر چهار ورودی را کامل کن.";
    else {
      try {
        result = computeCoinBubble({
          coinPriceToman: Number(coinPrice),
          gram18PriceToman: Number(goldPrice),
          weightGrams: Number(weight),
          purityPerThousand: Number(purity),
        });
      } catch (cause) {
        error = message(cause);
      }
    }
  }
  const resultNode = error ? (
    <Invalid body={error} />
  ) : result ? (
    <ResultGrid
      title="نتیجهٔ محاسبه"
      items={[
        {
          label: "ارزش ذاتی تقریبی",
          value: formatToman(result.intrinsicToman),
        },
        {
          label: "معادل طلای ۱۸ عیار",
          value: formatGrams(result.equivalentGram18),
        },
        {
          label: "مبلغ حباب",
          value: formatToman(result.bubbleToman),
          tone: result.bubbleToman > 0 ? "text-warning" : "text-positive",
        },
        {
          label: "درصد حباب",
          value: formatPct(Number(result.bubblePct.toFixed(2))),
          tone: result.bubblePct > 0 ? "text-warning" : "text-positive",
        },
      ]}
    />
  ) : (
    <EmptyState
      title="مشخصات سکه را وارد کن"
      body="قیمت بازار، قیمت طلای ۱۸ عیار، وزن و عیار رسمی همان سکه لازم است."
    />
  );
  return (
    <ToolPageShell
      title={META["coin-bubble"].title}
      slug="coin-bubble"
      intro="ارزش طلای داخل سکه را با قیمت بازار مقایسه کن. وزن و عیار از پیش حدس زده نمی‌شوند و باید از مشخصات معتبر همان سکه وارد شوند."
      method={
        <p>
          ارزش ذاتی = وزن × (عیار ÷ ۱۰۰۰) ÷ خلوص طلای ۱۸ عیار × قیمت هر گرم.
          حباب = قیمت بازار − ارزش ذاتی.
        </p>
      }
      result={resultNode}
      faqs={[
        {
          q: "حباب سکه چیست؟",
          a: "اختلاف قیمت بازار سکه با ارزش طلای موجود در آن است.",
        },
        {
          q: "وزن و عیار را از کجا بیاورم؟",
          a: "فقط از مشخصات رسمی همان سکه یا یک منبع معتبر استفاده کن.",
        },
        {
          q: "آیا حباب کم سیگنال خرید است؟",
          a: "خیر؛ این ابزار فقط یک نسبت را محاسبه می‌کند و توصیهٔ سرمایه‌گذاری نیست.",
        },
      ]}
    >
      <form method="get" className="grid gap-3 sm:grid-cols-2">
        <Input
          label="قیمت بازار سکه (تومان)"
          name="coinPrice"
          value={coinPrice}
          min={1}
        />
        <Input
          label="قیمت هر گرم طلای ۱۸ عیار (تومان)"
          name="goldPrice"
          value={goldPrice}
          min={1}
        />
        <Input
          label="وزن سکه (گرم)"
          name="weight"
          value={weight}
          min="0.001"
          step="0.001"
        />
        <Input
          label="عیار سکه از ۱۰۰۰"
          name="purity"
          value={purity}
          min={1}
          max={1000}
        />
        <Submit>محاسبهٔ حباب</Submit>
      </form>
    </ToolPageShell>
  );
}

function SavingsTool({ query }: { query: Params }) {
  const monthly = first(query.monthly);
  const months = first(query.months);
  const fee = first(query.fee);
  const price = first(query.price);
  const vat = getVatRatePct();
  const hasQuery = Object.keys(query).length > 0;
  let result: ReturnType<typeof computeSavingsPlan> | null = null;
  let error: string | null = null;
  if (hasQuery) {
    if (!complete([monthly, months, fee, price]))
      error = "هر چهار ورودی را کامل کن.";
    else {
      try {
        result = computeSavingsPlan({
          monthlyToman: Number(monthly),
          months: Number(months),
          buyFeePct: Number(fee),
          goldPricePerGramToman: Number(price),
          vatRatePct: vat,
        });
      } catch (cause) {
        error = message(cause);
      }
    }
  }
  const resultNode = error ? (
    <Invalid body={error} />
  ) : result ? (
    <section className="flex flex-col gap-4">
      {vat === null ? <VatWarning /> : null}
      <ResultGrid
        title="نتیجهٔ سناریوی قیمت ثابت"
        items={[
          { label: "جمع پرداخت", value: formatToman(result.totalPaidToman) },
          {
            label: "جمع کارمزد و مالیات مرتبط",
            value: formatToman(result.totalFeesToman),
            tone: "text-warning",
          },
          {
            label: "طلای انباشته",
            value: formatGrams(result.totalGoldGrams),
            tone: "text-gold",
          },
          {
            label: "هزینهٔ مؤثر هر گرم",
            value: formatToman(result.avgCostPerGramToman),
          },
        ]}
      />
    </section>
  ) : (
    <EmptyState
      title="سناریوی پس‌اندازت را وارد کن"
      body="مبلغ ماهانه، تعداد ماه، کارمزد و قیمت مرجع لازم است."
    />
  );
  return (
    <ToolPageShell
      title={META["savings-plan"].title}
      slug="savings-plan"
      intro="با یک قیمت مرجع ثابت ببین پس از کسر کارمزد چه مقدار طلا جمع می‌شود. این ابزار پیش‌بینی قیمت یا بازده نیست."
      method={
        <>
          <p>
            طلای هر ماه = (مبلغ ماهانه − کارمزد − مالیات مرتبط) ÷ قیمت مرجع؛ سپس
            در تعداد ماه ضرب می‌شود.
          </p>
          <p className="mt-2 text-xs text-muted">{VAT_NOTE}</p>
        </>
      }
      result={resultNode}
      faqs={[
        {
          q: "آیا قیمت آینده پیش‌بینی می‌شود؟",
          a: "خیر؛ همهٔ ماه‌ها با قیمت ثابتی که خودت وارد می‌کنی محاسبه می‌شوند.",
        },
        {
          q: "چرا قیمت ثابت است؟",
          a: "چون طلاسنج قیمت آینده را حدس نمی‌زند؛ برای سناریوی دیگر، ورودی را عوض کن.",
        },
        {
          q: "آیا خروجی توصیه به پس‌انداز طلاست؟",
          a: "خیر؛ فقط رابطهٔ مبلغ، کارمزد و مقدار طلا را نشان می‌دهد.",
        },
      ]}
    >
      <form method="get" className="grid gap-3 sm:grid-cols-2">
        <Input
          label="مبلغ ماهانه (تومان)"
          name="monthly"
          value={monthly}
          min={1}
        />
        <Input
          label="تعداد ماه"
          name="months"
          value={months}
          min={1}
          max={600}
        />
        <Input
          label="کارمزد خرید (درصد)"
          name="fee"
          value={fee}
          min={0}
          max="99.999"
          step="0.001"
        />
        <Input
          label="قیمت هر گرم طلای ۱۸ عیار (تومان)"
          name="price"
          value={price}
          min={1}
        />
        <Submit>محاسبهٔ سناریو</Submit>
      </form>
    </ToolPageShell>
  );
}

function EjratTool({ query }: { query: Params }) {
  const weight = first(query.weight);
  const price = first(query.price);
  const ejrat = first(query.ejrat);
  const profit = first(query.profit);
  const vat = getVatRatePct();
  const hasQuery = Object.keys(query).length > 0;
  let result: ReturnType<typeof computeEjratBreakdown> | null = null;
  let error: string | null = null;
  if (hasQuery) {
    if (!complete([weight, price, ejrat, profit]))
      error = "هر چهار ورودی را کامل کن.";
    else {
      try {
        result = computeEjratBreakdown({
          weightGrams: Number(weight),
          gram18PriceToman: Number(price),
          ejratPerGramToman: Number(ejrat),
          sellerProfitPct: Number(profit),
          vatRatePct: vat,
        });
      } catch (cause) {
        error = message(cause);
      }
    }
  }
  const resultNode = error ? (
    <Invalid body={error} />
  ) : result ? (
    <section className="flex flex-col gap-4">
      {vat === null ? <VatWarning /> : null}
      <ResultGrid
        title="تفکیک قیمت نهایی"
        items={[
          { label: "ارزش طلای خام", value: formatToman(result.goldValueToman) },
          { label: "اجرت ساخت", value: formatToman(result.ejratToman) },
          {
            label: "سود فروشنده",
            value: formatToman(result.sellerProfitToman),
          },
          {
            label: "مالیات بر اجرت و سود",
            value: formatToman(result.vatToman),
          },
          {
            label: "قیمت نهایی",
            value: formatToman(result.finalPriceToman),
            tone: "text-gold",
          },
          {
            label: "هزینهٔ افزوده",
            value: formatPct(Number(result.effectiveMarkupPct.toFixed(2))),
          },
        ]}
      />
    </section>
  ) : (
    <EmptyState
      title="مشخصات فاکتور را وارد کن"
      body="وزن، قیمت هر گرم، اجرت هر گرم و درصد سود لازم است."
    />
  );
  return (
    <ToolPageShell
      title={META.ejrat.title}
      slug="ejrat"
      intro="قیمت طلای زینتی را به اجزایش باز کن تا سهم خود طلا، اجرت، سود و مالیات مرتبط روشن باشد."
      method={
        <>
          <p>
            ارزش طلا = وزن × قیمت هر گرم؛ سود روی ارزش طلا و اجرت محاسبه می‌شود؛
            اصل طلا از مالیات معاف است.
          </p>
          <p className="mt-2 text-xs text-muted">{VAT_NOTE}</p>
        </>
      }
      result={resultNode}
      faqs={[
        {
          q: "اجرت ساخت چیست؟",
          a: "دستمزد طراحی و ساخت قطعه است و هنگام فروش معمولاً بازنمی‌گردد.",
        },
        {
          q: "مالیات روی کدام بخش است؟",
          a: "طبق پیکربندی طلاسنج، روی اجرت و سود است، نه اصل طلا.",
        },
        {
          q: "آیا مبلغ فاکتور دقیقاً همین است؟",
          a: "فقط اگر همهٔ ورودی‌ها با فاکتور برابر باشند؛ فاکتور رسمی مرجع نهایی است.",
        },
      ]}
    >
      <form method="get" className="grid gap-3 sm:grid-cols-2">
        <Input
          label="وزن طلا (گرم)"
          name="weight"
          value={weight}
          min="0.001"
          step="0.001"
        />
        <Input
          label="قیمت هر گرم طلای ۱۸ عیار (تومان)"
          name="price"
          value={price}
          min={1}
        />
        <Input label="اجرت هر گرم (تومان)" name="ejrat" value={ejrat} min={0} />
        <Input
          label="سود فروشنده (درصد)"
          name="profit"
          value={profit}
          min={0}
          max={100}
          step="0.01"
        />
        <Submit>تفکیک قیمت</Submit>
      </form>
    </ToolPageShell>
  );
}

function BreakEvenTool({ query }: { query: Params }) {
  const buy = first(query.buyFee);
  const sell = first(query.sellFee);
  const vat = getVatRatePct();
  const hasQuery = Object.keys(query).length > 0;
  let result: ReturnType<typeof computeBreakEven> | null = null;
  let error: string | null = null;
  if (hasQuery) {
    if (!complete([buy, sell])) error = "کارمزد خرید و فروش را کامل وارد کن.";
    else {
      try {
        result = computeBreakEven({
          buyFeePct: Number(buy),
          sellFeePct: Number(sell),
          vatRatePct: vat,
        });
      } catch (cause) {
        error = message(cause);
      }
    }
  }
  const resultNode = error ? (
    <Invalid body={error} />
  ) : result ? (
    <section className="flex flex-col gap-4">
      {vat === null ? <VatWarning /> : null}
      <ResultGrid
        title="نتیجهٔ نقطهٔ سر‌به‌سر"
        items={[
          {
            label: "رشد لازم قیمت",
            value: formatPct(Number(result.breakEvenPct.toFixed(3))),
            tone: "text-gold",
          },
          {
            label: "کارمزد مؤثر خرید",
            value: formatPct(Number(result.effectiveBuyFeePct.toFixed(3))),
          },
          {
            label: "کارمزد مؤثر فروش",
            value: formatPct(Number(result.effectiveSellFeePct.toFixed(3))),
          },
          {
            label: "جمع اسمی هزینه‌ها",
            value: formatPct(Number(result.nominalRoundTripPct.toFixed(3))),
          },
        ]}
      />
    </section>
  ) : (
    <EmptyState
      title="کارمزدهای رفت‌وبرگشت را وارد کن"
      body="اعداد را از منبع معتبر همان پلتفرم یا روش بردار."
    />
  );
  return (
    <ToolPageShell
      title={META["break-even"].title}
      slug="break-even"
      intro="درصد رشد لازم را ببین تا هزینهٔ کارمزد خرید و فروش جبران شود؛ این ابزار زمان یا جهت حرکت قیمت را پیش‌بینی نمی‌کند."
      method={
        <>
          <p>رشد سر‌به‌سر = ۱ ÷ ((۱ − کارمزد خرید) × (۱ − کارمزد فروش)) − ۱.</p>
          <p className="mt-2 text-xs text-muted">{VAT_NOTE}</p>
        </>
      }
      result={resultNode}
      faqs={[
        {
          q: "چرا نتیجه کمی بیشتر از جمع کارمزدهاست؟",
          a: "چون اثر دو مرحلهٔ خرید و فروش ترکیبی است، نه فقط جمع ساده.",
        },
        {
          q: "آیا رسیدن به این درصد یعنی سود؟",
          a: "فقط هزینه‌های واردشده جبران می‌شوند؛ هزینه‌های واردنشده پوشش داده نمی‌شوند.",
        },
        {
          q: "زمان رسیدن را هم می‌گوید؟",
          a: "خیر؛ هیچ پیش‌بینی زمانی یا قیمتی انجام نمی‌شود.",
        },
      ]}
    >
      <form method="get" className="flex flex-wrap items-end gap-3">
        <Input
          label="کارمزد خرید (درصد)"
          name="buyFee"
          value={buy}
          min={0}
          max="99.999"
          step="0.001"
        />
        <Input
          label="کارمزد فروش (درصد)"
          name="sellFee"
          value={sell}
          min={0}
          max="99.999"
          step="0.001"
        />
        <Submit>محاسبهٔ سر‌به‌سر</Submit>
      </form>
    </ToolPageShell>
  );
}

function MethodCompareTool({ query }: { query: Params }) {
  const raw = first(query.priority);
  const allowed: MethodPriority[] = ["all", "small", "physical", "bourse"];
  const priority: MethodPriority = allowed.includes(raw as MethodPriority)
    ? (raw as MethodPriority)
    : "all";
  const methods = filterMethodsByPriority(priority);
  return (
    <ToolPageShell
      title={META["method-compare"].title}
      slug="method-compare"
      intro="هفت مسیر رایج را با معیارهای یکسان کنار هم ببین. ترتیب جدول رتبه‌بندی یا توصیهٔ سرمایه‌گذاری نیست."
      method={
        <p>
          فیلتر فقط روش‌هایی را نگه می‌دارد که با اولویت انتخابی برچسب مشترک
          دارند؛ هیچ قیمت یا بازدهی ساخته نمی‌شود.
        </p>
      }
      result={
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">مقایسهٔ کنارهم</h2>
          <div className="overflow-x-auto rounded-2xl border border-muted/20">
            <table className="w-full min-w-[850px] border-collapse text-sm">
              <thead className="bg-bg-surface text-xs text-muted">
                <tr>
                  <th className="px-4 py-3 text-start">روش</th>
                  <th className="px-4 py-3 text-start">مبلغ شروع</th>
                  <th className="px-4 py-3 text-start">نقدشوندگی</th>
                  <th className="px-4 py-3 text-start">فیزیکی</th>
                  <th className="px-4 py-3 text-start">کد بورسی</th>
                  <th className="px-4 py-3 text-start">هزینهٔ اصلی</th>
                  <th className="px-4 py-3 text-start">جزئیات</th>
                </tr>
              </thead>
              <tbody>
                {methods.map((method) => (
                  <tr key={method.slug} className="border-t border-muted/10">
                    <th className="px-4 py-3 text-start">{method.nameFa}</th>
                    <td className="px-4 py-3">{method.startingLevel}</td>
                    <td className="px-4 py-3">{method.liquidity}</td>
                    <td className="px-4 py-3">{method.physical}</td>
                    <td className="px-4 py-3">
                      {method.bourseCode ? "لازم است" : "لازم نیست"}
                    </td>
                    <td className="px-4 py-3">{method.mainCost}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/methods/${method.slug}/`}
                        className="text-gold underline"
                      >
                        شرح کامل
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <RiskFlag
            severity="info"
            title="این فیلتر رتبه‌بندی نیست"
            body="روش‌ها فقط با اولویت انتخابی هم‌پوشانی دارند؛ محدودیت‌های هر مسیر را جداگانه بررسی کن."
          />
        </section>
      }
      faqs={[
        { q: "آیا روش اول بهتر است؟", a: "خیر؛ ترتیب جدول رتبه‌بندی نیست." },
        {
          q: "چرا بازده در جدول نیست؟",
          a: "بازده آینده قابل پیش‌بینی دقیق نیست و این ابزار ویژگی‌ها را مقایسه می‌کند.",
        },
        {
          q: "بعد از انتخاب روش چه کنم؟",
          a: "شرح کامل روش و سپس ارائه‌دهندگان ثبت‌شده را ببین.",
        },
      ]}
    >
      <form method="get" className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-64 flex-col gap-1 text-xs text-muted">
          اولویت مقایسه
          <select
            name="priority"
            defaultValue={priority}
            className={INPUT_CLASS}
          >
            <option value="all">نمایش همهٔ روش‌ها</option>
            <option value="small">شروع با مبلغ کم</option>
            <option value="physical">امکان فیزیکی</option>
            <option value="bourse">مسیرهای بورسی</option>
          </select>
        </label>
        <Submit>اعمال فیلتر</Submit>
      </form>
    </ToolPageShell>
  );
}

export default async function ToolPage({ params, searchParams }: PageProps) {
  const [{ tool }, query] = await Promise.all([params, searchParams]);
  if (!isTool(tool)) notFound();
  switch (tool) {
    case "coin-bubble":
      return <CoinTool query={query} />;
    case "savings-plan":
      return <SavingsTool query={query} />;
    case "ejrat":
      return <EjratTool query={query} />;
    case "break-even":
      return <BreakEvenTool query={query} />;
    case "method-compare":
      return <MethodCompareTool query={query} />;
  }
}
