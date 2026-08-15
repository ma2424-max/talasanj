type Props = {
  title: string;
  body?: string;
  actionLabel?: string;
  actionHref?: string;
};

/** حالت خالی — «دادهٔ ناکامل» بخشی از قالب است، نه استثنا */
export function EmptyState({ title, body, actionLabel, actionHref }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-muted/30 p-8 text-center">
      <p className="font-bold text-cream">{title}</p>
      {body ? (
        <p className="measure text-sm leading-7 text-muted">{body}</p>
      ) : null}
      {actionLabel && actionHref ? (
        <a
          href={actionHref}
          className="mt-1 rounded-xl border border-gold/40 px-4 py-2 text-sm text-gold"
        >
          {actionLabel}
        </a>
      ) : null}
    </div>
  );
}
