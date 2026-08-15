export type MethodPriority = "all" | "small" | "physical" | "bourse";

export type MethodComparison = {
  slug: string;
  nameFa: string;
  startingLevel: "کم" | "متوسط" | "بالا" | "متغیر";
  liquidity: "بالا" | "متوسط" | "وابسته به پلتفرم";
  physical: "دارد" | "ندارد" | "اختیاری";
  bourseCode: boolean;
  mainCost: string;
  suitableFor: string;
  priorities: Exclude<MethodPriority, "all">[];
};

/** مقایسهٔ کیفی؛ ترتیب فهرست رتبه‌بندی سرمایه‌گذاری نیست. */
export const METHOD_COMPARISONS: MethodComparison[] = [
  {
    slug: "molten-gold",
    nameFa: "طلای آب‌شدهٔ آنلاین",
    startingLevel: "کم",
    liquidity: "وابسته به پلتفرم",
    physical: "اختیاری",
    bourseCode: false,
    mainCost: "کارمزد خرید و فروش",
    suitableFor: "شروع با مبلغ کم و معاملهٔ آنلاین",
    priorities: ["small", "physical"],
  },
  {
    slug: "gold-bar",
    nameFa: "شمش طلا",
    startingLevel: "بالا",
    liquidity: "متوسط",
    physical: "دارد",
    bourseCode: false,
    mainCost: "بسته‌بندی، اختلاف خرید و فروش و تحویل",
    suitableFor: "نگهداری فیزیکی با وزن استاندارد",
    priorities: ["physical"],
  },
  {
    slug: "coin",
    nameFa: "سکهٔ طلا",
    startingLevel: "متغیر",
    liquidity: "بالا",
    physical: "دارد",
    bourseCode: false,
    mainCost: "حباب و اختلاف خرید و فروش",
    suitableFor: "نقدشوندگی عمومی و نگهداری فیزیکی",
    priorities: ["physical"],
  },
  {
    slug: "jewelry",
    nameFa: "طلای زینتی",
    startingLevel: "متغیر",
    liquidity: "بالا",
    physical: "دارد",
    bourseCode: false,
    mainCost: "اجرت ساخت، سود فروشنده و مالیات مرتبط",
    suitableFor: "استفادهٔ زینتی در کنار حفظ ارزش",
    priorities: ["physical"],
  },
  {
    slug: "gold-fund",
    nameFa: "صندوق طلا",
    startingLevel: "کم",
    liquidity: "بالا",
    physical: "ندارد",
    bourseCode: true,
    mainCost: "کارمزد معامله و مدیریت صندوق",
    suitableFor: "نگهداری طلا در پرتفوی بورسی",
    priorities: ["small", "bourse"],
  },
  {
    slug: "commodity-certificate",
    nameFa: "گواهی سپردهٔ کالایی",
    startingLevel: "متوسط",
    liquidity: "متوسط",
    physical: "اختیاری",
    bourseCode: true,
    mainCost: "معامله، انبارداری و تحویل",
    suitableFor: "دارایی سپرده‌شده در انبار رسمی",
    priorities: ["physical", "bourse"],
  },
  {
    slug: "digital-gold",
    nameFa: "طلای دیجیتال",
    startingLevel: "کم",
    liquidity: "وابسته به پلتفرم",
    physical: "اختیاری",
    bourseCode: false,
    mainCost: "کارمزد خرید، فروش و گاهی تحویل",
    suitableFor: "خرید خرد پس از بررسی پشتوانه و وضعیت حقوقی",
    priorities: ["small", "physical"],
  },
];

export function filterMethodsByPriority(priority: MethodPriority) {
  return priority === "all"
    ? [...METHOD_COMPARISONS]
    : METHOD_COMPARISONS.filter((method) =>
        method.priorities.includes(priority),
      );
}
