type Props = {
  /** موضوع گزارش — مثلاً slug پلتفرم یا آدرس صفحه */
  subject?: string;
};

/** دکمهٔ «گزارش دادهٔ نادرست» — ورودی SLA هفتادودوساعتهٔ §۱۷.۵ سند ساخت */
export function ReportDataButton({ subject }: Props) {
  const href = `/contact/?topic=data-error${subject ? `&subject=${encodeURIComponent(subject)}` : ""}`;
  return (
    <a
      href={href}
      className="inline-flex items-center gap-1 rounded-xl border border-muted/30 px-4 py-2 text-sm text-muted transition-colors hover:border-gold hover:text-gold"
    >
      <span aria-hidden>✎</span>
      گزارش دادهٔ نادرست
    </a>
  );
}
