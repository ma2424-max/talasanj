import { formatFaDate } from "@/lib/format";

type Props = {
  date: string;
  summary: string;
};

/** اعلان اصلاحیه — بالای سکشنی که داده‌اش اصلاح شده است */
export function CorrectionNotice({ date, summary }: Props) {
  return (
    <div className="rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm leading-7">
      <p>
        <span className="font-bold text-warning">اصلاحیه:</span> در تاریخ{" "}
        {formatFaDate(date)} این بخش اصلاح شد — {summary}
      </p>
      <a
        href="/corrections/"
        className="mt-1 inline-block text-xs text-muted underline decoration-dotted underline-offset-4 hover:text-gold"
      >
        مشاهدهٔ همهٔ اصلاحات
      </a>
    </div>
  );
}
