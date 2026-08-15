const LEVELS = {
  declared: {
    label: "اعلامی پلتفرم",
    title: "این عدد را خود پلتفرم اعلام کرده و ما آن را مستقیم نکرده‌ایم",
    classes: "border-muted/40 text-muted",
  },
  observed: {
    label: "مشاهده‌شده",
    title: "این داده را تیم طلاسنج خودش مشاهده و ثبت کرده است",
    classes: "border-positive/40 text-positive",
  },
  reported: {
    label: "گزارش کاربران",
    title: "این داده از گزارش کاربران آمده و هنوز تأیید مستقل نشده است",
    classes: "border-warning/40 text-warning",
  },
  unknown: {
    label: "نامشخص",
    title: "دادهٔ کافی برای این مورد نداریم",
    classes: "border-muted/30 text-muted",
  },
} as const;

type Props = { level: keyof typeof LEVELS };

/** برچسب سطح اطمینان داده — §۶ سند ساخت */
export function ConfidenceTag({ level }: Props) {
  const item = LEVELS[level];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[0.7rem] ${item.classes}`}
      title={item.title}
    >
      {item.label}
    </span>
  );
}
