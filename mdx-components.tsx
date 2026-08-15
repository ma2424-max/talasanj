import type { MDXComponents } from "mdx/types";

/**
 * نگاشت تگ‌های MDX به استایل دیزاین‌سیستم طلاسنج.
 * توجه: تیتر H1 در بدنهٔ راهنما ممنوع است — H1 از GuideShell می‌آید.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: (props) => (
      <h2 className="mt-10 mb-4 text-2xl font-bold text-cream" {...props} />
    ),
    h3: (props) => (
      <h3 className="mt-8 mb-3 text-lg font-bold text-cream" {...props} />
    ),
    p: (props) => <p className="measure leading-8 text-cream/85" {...props} />,
    a: (props) => (
      <a
        className="text-gold underline decoration-dotted underline-offset-4"
        {...props}
      />
    ),
    strong: (props) => <strong className="font-bold text-cream" {...props} />,
    ul: (props) => (
      <ul
        className="measure my-4 flex list-disc flex-col gap-2 pe-6 leading-8 text-cream/85"
        {...props}
      />
    ),
    ol: (props) => (
      <ol
        className="measure my-4 flex list-decimal flex-col gap-2 pe-6 leading-8 text-cream/85"
        {...props}
      />
    ),
    blockquote: (props) => (
      <blockquote
        className="measure my-6 rounded-xl border-r-2 border-gold bg-bg-surface p-4 leading-8 text-cream/80"
        {...props}
      />
    ),
    hr: () => <hr className="my-10 border-muted/20" />,
    ...components,
  };
}
