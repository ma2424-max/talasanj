import { formatFaDate } from "@/lib/format";

type Props = {
  title: string;
  url: string;
  accessedAt?: string;
};

/** ارجاع به منبع داده — کنار هر عدد مالی */
export function SourceCite({ title, url, accessedAt }: Props) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1 text-xs text-muted">
      <span aria-hidden>↗</span>
      <a
        href={url}
        target="_blank"
        rel="nofollow noopener noreferrer"
        className="underline decoration-dotted underline-offset-4 transition-colors hover:text-gold"
      >
        منبع: {title}
      </a>
      {accessedAt ? <span>({formatFaDate(accessedAt)})</span> : null}
    </span>
  );
}
