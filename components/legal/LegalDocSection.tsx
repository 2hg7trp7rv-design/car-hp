import type { ReactNode } from "react";

type Props = {
  index?: string;
  title: string;
  children: ReactNode;
};

export function LegalDocSection({ index, title, children }: Props) {
  return (
    <section className="border-t border-[var(--border-default)] pt-8 first:border-t-0 first:pt-0">
      <div className="grid gap-4 lg:grid-cols-[120px_minmax(0,1fr)] lg:gap-6">
        <div className="pt-1 text-[10px] font-semibold tracking-[0.2em] text-[var(--text-tertiary)] uppercase">
          {index ?? "Section"}
        </div>

        <div>
          <h2 className="text-[24px] font-semibold leading-[1.24] tracking-[-0.03em] text-[var(--text-primary)] sm:text-[28px]">
            {title}
          </h2>
          <div className="mt-4 space-y-4 text-[15px] leading-[1.95] text-[var(--text-secondary)] [&_a]:text-[var(--accent-strong)] [&_a]:underline [&_a]:decoration-[rgba(27,63,229,0.34)] [&_a]:underline-offset-4 [&_ol]:ml-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_strong]:font-semibold [&_strong]:text-[var(--text-primary)] [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-2">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

export default LegalDocSection;
