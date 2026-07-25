type SourceTier = {
  label: string;
  title: string;
  items: readonly string[];
  body: string;
};

type Props = {
  tiers: readonly SourceTier[];
};

export function LegalSourceHierarchy({ tiers }: Props) {
  return (
    <section className="rounded-[28px] border border-black/10 bg-[var(--paper)] p-4 sm:p-5">
      <div className="space-y-3">
        {tiers.map((tier, index) => (
          <article
            key={tier.label}
            className="grid gap-4 rounded-[22px] border border-black/10 bg-white/[0.72] p-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:p-5"
          >
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--teal)]">
                {tier.label}
              </p>
              <div className="mt-3 text-[28px] font-semibold leading-none tracking-[-0.08em] text-[var(--navy)]">
                {String(index + 1).padStart(2, "0")}
              </div>
            </div>
            <div>
              <h3 className="text-[22px] font-semibold leading-[1.16] tracking-[-0.055em] text-[var(--navy)]">
                {tier.title}
              </h3>
              <p className="mt-3 text-[13px] leading-[1.9] text-[var(--ink-soft)]">
                {tier.body}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {tier.items.map((item) => (
                  <span key={item} className="rounded-full border border-black/10 bg-[var(--paper)] px-3 py-1.5 text-[11px] text-[#3f494f]">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default LegalSourceHierarchy;
