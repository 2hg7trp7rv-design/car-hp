import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type MetaItem = {
  label: string;
  value: ReactNode;
};

type Props = {
  eyebrow?: string;
  title: string;
  lead: string;
  meta?: MetaItem[];
};

export function LegalDocHeader({
  eyebrow = "運営と信頼",
  title,
  lead,
  meta = [],
}: Props) {
  return (
    <header className="relative overflow-hidden rounded-[30px] border border-black/10 bg-[#f9f5ee] p-[clamp(20px,4vw,36px)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(0,112,141,0.55),transparent)]" />
      <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[#00708d]/10 blur-3xl" />

      <div className="relative">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#00708d]">
          {eyebrow}
        </p>
        <h1 className="mt-5 max-w-[13ch] text-[clamp(34px,6vw,64px)] font-semibold leading-[0.98] tracking-[-0.075em] text-[#080b0d]">
          {title}
        </h1>
        <p className="mt-6 max-w-3xl text-[clamp(14px,2vw,17px)] leading-[2.05] tracking-[0.02em] text-[#2b343a]">
          {lead}
        </p>
      </div>

      {meta.length ? (
        <div className="relative mt-8 overflow-hidden rounded-[22px] border border-black/10 bg-white/70">
          <div className="grid divide-y divide-black/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-3">
            {meta.map((item, index) => (
              <div
                key={item.label}
                className={cn(
                  "px-4 py-4 sm:px-5",
                  index >= 2 ? "sm:border-t sm:border-black/10 xl:border-t-0" : "",
                )}
              >
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/36">
                  {item.label}
                </div>
                <div className="mt-2 text-[14px] leading-[1.75] text-[#101519]">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}

export default LegalDocHeader;
