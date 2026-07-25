import type { ReactNode } from "react";

type Props = {
  index?: string;
  title: string;
  children: ReactNode;
};

export function LegalDocSection({ index, title, children }: Props) {
  return (
    <section className="group border-t border-black/10 pt-9 first:border-t-0 first:pt-0">
      <div className="grid gap-5 lg:grid-cols-[92px_minmax(0,1fr)] lg:gap-8">
        <div className="pt-1">
          <div className="inline-flex min-w-12 items-center justify-center rounded-full border border-black/10 bg-[var(--navy)] px-3 py-1.5 text-[10px] font-semibold tracking-[0.18em] text-white/74">
            {index ?? "SEC"}
          </div>
        </div>

        <div>
          <h2 className="max-w-[18ch] text-[clamp(23px,3.7vw,34px)] font-semibold leading-[1.16] tracking-[-0.055em] text-[var(--navy)]">
            {title}
          </h2>
          <div className="mt-5 space-y-4 text-[15px] leading-[2.05] tracking-[0.01em] text-[#3f494f] [&_a]:font-medium [&_a]:text-[var(--teal)] [&_a]:underline [&_a]:decoration-[rgba(14,124,123,0.24)] [&_a]:underline-offset-4 [&_ol]:ml-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_strong]:font-semibold [&_strong]:text-[#111619] [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-2">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

export default LegalDocSection;
