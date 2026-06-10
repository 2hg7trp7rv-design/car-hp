import type { ReactNode } from "react";

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
    <header className="space-y-5">
      <div>
        <p className="cb-kicker">{eyebrow}</p>
        <h1 className="mt-4 text-[34px] font-semibold leading-[1.08] tracking-[-0.05em] text-[var(--text-primary)] sm:text-[42px] lg:text-[48px]">
          {title}
        </h1>
        <p className="mt-4 max-w-3xl text-[15px] leading-[1.95] text-[var(--text-secondary)]">
          {lead}
        </p>
      </div>

      {meta.length ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {meta.map((item) => (
            <div
              key={item.label}
              className="rounded-[22px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.82)] px-4 py-4"
            >
              <div className="text-[10px] font-semibold tracking-[0.18em] text-[var(--text-tertiary)] uppercase">
                {item.label}
              </div>
              <div className="mt-2 text-[14px] leading-[1.8] text-[var(--text-primary)]">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </header>
  );
}

export default LegalDocHeader;
