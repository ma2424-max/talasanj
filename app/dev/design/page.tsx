import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  CompareTable,
  CompareTray,
  ConfidenceTag,
  CorrectionNotice,
  DataFreshnessBadge,
  DisclosureBanner,
  EmptyState,
  FeeTable,
  FilterBar,
  ReportDataButton,
  RiskFlag,
  ScoreBadge,
  SourceCite,
  ToolPanel,
} from "@/components";

export const metadata: Metadata = {
  title: "گالری دیزاین (صفحهٔ داخلی)",
  robots: { index: false, follow: false },
};

/** گالری ۱۴ کامپوننت دیزاین سیستم — فقط محیط توسعه؛ قبل از پرتاب محدود می‌شود */

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 border-b border-muted/10 pb-10">
      <h2 className="text-xl font-bold text-gold">{title}</h2>
      {note ? (
        <p className="measure text-sm leading-7 text-cream/60">{note}</p>
      ) : null}
      <div className="flex flex-wrap items-start gap-6 rounded-xl bg-bg-base p-6">
        {children}
      </div>
    </section>
  );
}

const demoMethods = [
  { slug: "molten-gold", nameFa: "طلای آب‌شده" },
  { slug: "gold-bar", nameFa: "شمش طلا" },
  { slug: "coin", nameFa: "سکهٔ طلا" },
  { slug: "jewelry", nameFa: "طلای زینتی" },
  { slug: "gold-fund", nameFa: "صندوق طلا" },
  { slug: "commodity-certificate", nameFa: "گواهی سپرده کالایی" },
  { slug: "digital-gold", nameFa: "طلای دیجیتال" },
];

export default function DesignGalleryPage() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-2">
        <p className="w-fit rounded-full border border-gold/40 px-4 py-1 text-sm text-gold">
          صفحهٔ داخلی — noindex
        </p>
        <h1 className="text-3xl font-bold">گالری دیزاین سیستم طلاسنج</h1>
        <p className="measure leading-8 text-cream/70">
          هر ۱۴ کامپوننت در حالت‌های مختلف. هر PR که کامپوننتی را تغییر دهد باید
          اسکرین‌شات همین صفحه را داشته باشد.
        </p>
      </header>

      <Section
        title="۱. ScoreBadge"
        note="امتیاز عادی، دادهٔ ناکامل (سقف ۷۵)، و حالت بدون داده"
      >
        <ScoreBadge score={87} size="lg" />
        <ScoreBadge score={82} incomplete size="lg" />
        <ScoreBadge score={64} size="lg" />
        <ScoreBadge score={41} size="lg" />
        <ScoreBadge score={null} size="lg" />
      </Section>

      <Section
        title="۲. DataFreshnessBadge"
        note="سبز تا ۷ روز، کهربایی تا ۳۰ روز، قرمز پس از آن"
      >
        <DataFreshnessBadge date="2026-08-14" />
        <DataFreshnessBadge date="2026-07-25" />
        <DataFreshnessBadge date="2026-05-01" />
      </Section>

      <Section title="۳. ConfidenceTag" note="چهار سطح اطمینان داده">
        <ConfidenceTag level="declared" />
        <ConfidenceTag level="observed" />
        <ConfidenceTag level="reported" />
        <ConfidenceTag level="unknown" />
      </Section>

      <Section title="۴. SourceCite" note="ارجاع به منبع کنار هر عدد">
        <SourceCite
          title="صفحهٔ تعرفه‌های پلتفرم نمایشی"
          url="https://example.com/fees"
          accessedAt="2026-08-01"
        />
      </Section>

      <Section
        title="۵. FeeTable"
        note="ردیف دوم عمداً «نامشخص» دارد تا رفتار نبود داده دیده شود"
      >
        <FeeTable
          rows={[
            {
              id: 1,
              method: "molten-gold",
              methodNameFa: "طلای آب‌شده",
              buyFeePct: "0.5",
              sellFeePct: "0.7",
              minBuyToman: 100000,
              withdrawalFeeToman: null,
              physicalDelivery: true,
              observedAt: new Date("2026-08-01"),
              fieldMeta: {
                buyFeePct: {
                  confidence: "declared",
                  source: "https://example.com/fees",
                  observedAt: "2026-08-01",
                },
                minBuyToman: {
                  confidence: "observed",
                  source: "https://example.com",
                  observedAt: "2026-08-01",
                },
              },
            },
            {
              id: 2,
              method: "gold-bar",
              methodNameFa: "شمش طلا",
              buyFeePct: null,
              sellFeePct: null,
              minBuyToman: null,
              withdrawalFeeToman: null,
              physicalDelivery: null,
              observedAt: null,
              fieldMeta: {},
            },
          ]}
        />
      </Section>

      <Section
        title="۶. CompareTable"
        note="سلول برنده فقط وقتی اختلاف معنادار است سبز می‌شود"
      >
        <CompareTable
          nameA="پلتفرم نمایشی الف"
          nameB="پلتفرم نمایشی ب"
          rows={[
            {
              label: "امتیاز طلاسنج",
              a: <ScoreBadge score={87} size="sm" />,
              b: <ScoreBadge score={71} size="sm" />,
              better: "a",
            },
            { label: "کارمزد خرید", a: "۰٫۵٪", b: "۰٫۵٪", better: null },
            {
              label: "حداقل خرید",
              a: "۱۰۰٬۰۰۰ تومان",
              b: "۵۰۰٬۰۰۰ تومان",
              better: "a",
            },
            { label: "تحویل فیزیکی", a: "دارد", b: "نامشخص", better: null },
          ]}
        />
      </Section>

      <Section
        title="۷. CompareTray"
        note="نمایشی ثابت؛ حالت واقعی شناور پایین صفحه است"
      >
        <div className="relative h-24 w-full rounded-xl border border-muted/20">
          <CompareTray
            items={[
              { slug: "example-platform", nameFa: "پلتفرم نمایشی الف" },
              { slug: "example-b", nameFa: "پلتفرم نمایشی ب" },
            ]}
          />
        </div>
      </Section>

      <Section
        title="۸. FilterBar"
        note="فرم GET استاندارد؛ بدون JavaScript هم کار می‌کند"
      >
        <FilterBar methods={demoMethods} />
      </Section>

      <Section title="۹. RiskFlag" note="سه سطح: نکته، هشدار، هشدار مهم">
        <RiskFlag
          severity="info"
          title="بررسی در جریان است"
          body="بخشی از داده‌های این پلتفرم در حال راستی‌آزمایی است."
        />
        <RiskFlag
          severity="warning"
          title="دادهٔ کهنه"
          body="کارمزدهای این صفحه بیش از ۳۰ روز است که به‌روز نشده‌اند."
        />
        <RiskFlag
          severity="critical"
          title="فعالیت متوقف شده"
          body="این پلتفرم فعلاً امکان ثبت سفارش ندارد؛ قبل از هر اقدام وضعیت را بررسی کن."
        />
      </Section>

      <Section
        title="۱۰. ToolPanel"
        note="باکس «چطور محاسبه شد؟» همیشه پیش‌فرض باز است"
      >
        <ToolPanel
          title="محاسبه‌گر هزینهٔ واقعی (نمایشی)"
          description="مبلغ را وارد کن تا هزینهٔ واقعی هر مسیر را ببینی."
          howItWorks={
            <p>
              هزینهٔ واقعی = قیمت طلا + کارمزد خرید + مالیاتِ پایهٔ مشمول (طبق
              assumptions.json) − ارزش بازخرید. اعداد این صفحه نمایشی‌اند.
            </p>
          }
        >
          <form className="flex flex-wrap items-end gap-3" action="#">
            <label className="flex flex-col gap-1 text-xs text-muted">
              مبلغ (تومان)
              <input
                type="number"
                name="amount"
                placeholder="۵۰۰۰۰۰۰۰"
                className="tnum rounded-lg border border-muted/30 bg-bg-base px-3 py-2 text-sm text-cream"
              />
            </label>
            <button
              type="submit"
              className="rounded-xl bg-gold px-5 py-2 text-sm font-bold text-bg-base"
            >
              محاسبه کن
            </button>
          </form>
        </ToolPanel>
      </Section>

      <Section title="۱۱. DisclosureBanner" note="دو حالت: عمومی و لینک همکاری">
        <DisclosureBanner variant="general" />
        <DisclosureBanner variant="affiliate" />
      </Section>

      <Section
        title="۱۲. CorrectionNotice"
        note="وقتی داده‌ای اصلاح می‌شود، علناً اعلام می‌کنیم"
      >
        <CorrectionNotice
          date="2026-08-10"
          summary="کارمزد فروش از ۰٫۹٪ به ۰٫۷٪ اصلاح شد (به استناد صفحهٔ تعرفهٔ رسمی)."
        />
      </Section>

      <Section title="۱۳. ReportDataButton">
        <ReportDataButton subject="example-platform" />
      </Section>

      <Section title="۱۴. EmptyState" note="با و بدون دکمهٔ اقدام">
        <EmptyState
          title="به حد نصاب نظرات نرسیده‌ایم"
          body="برای نمایش میانگین، حداقل ۵ تجربهٔ تأییدشده لازم است. اولین نفر باش."
          actionLabel="ثبت تجربهٔ من"
          actionHref="/contact/"
        />
        <EmptyState
          title="نتیجه‌ای با این فیلترها نیست"
          body="یکی از فیلترها را حذف کن تا نتیجه ببینی."
        />
      </Section>
    </main>
  );
}
