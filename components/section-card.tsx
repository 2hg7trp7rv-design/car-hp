// components/section-card.tsx
import { ReactNode } from "react";
import Link from "next/link";

type SectionCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  highlight?: string;
  href?: string;
  actions?: ReactNode;
};

export function SectionCard({
  eyebrow,
  title,
  description,
  highlight,
  href,
  actions,
}: SectionCardProps) {
  const content = (
    <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/80 px-5 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-md sm:px-7 sm:py-7">
      <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/40 to-teal-50/40 opacity-70" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/70 bg-teal-50/80 px-3 py-1 text-xs font-medium tracking-wide text-teal-800">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
            <span>{eyebrow}</span>
          </div>
          <div className="space-y-2">
            <h1 className="serif-font text-2xl font-semibold text-slate-900 sm:text-3xl">
              {title}
            </h1>
            {highlight && (
              <p className="text-sm font-medium text-teal-800">
                {highlight}
              </p>
            )}
            <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-[15px]">
              {description}
            </p>
          </div>
        </div>
        {actions && (
          <div className="mt-3 flex shrink-0 flex-col items-start gap-2 sm:mt-0 sm:items-end">
            {actions}
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent">
        {content}
      </Link>
    );
  }

  return content;
}
