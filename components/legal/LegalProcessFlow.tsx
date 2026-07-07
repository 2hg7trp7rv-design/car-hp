type ProcessItem = {
  label: string;
  title: string;
  body: string;
};

type Props = {
  items: readonly ProcessItem[];
};

export function LegalProcessFlow({ items }: Props) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-black/10 bg-[#080b0d] text-white">
      <div className="border-b border-white/10 p-5 sm:p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/30">
          PROCESS
        </p>
        <h2 className="mt-3 text-[clamp(24px,4vw,38px)] font-semibold leading-[1.06] tracking-[-0.06em] text-white/[0.92]">
          制作フロー
        </h2>
      </div>
      <div className="grid divide-y divide-white/10 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
        {items.map((item) => (
          <article key={item.label} className="p-5 sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#00708d]">
              {item.label}
            </p>
            <h3 className="mt-3 text-[18px] font-semibold tracking-[-0.04em] text-white/[0.9]">
              {item.title}
            </h3>
            <p className="mt-3 text-[12px] leading-[1.85] text-white/[0.42]">
              {item.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default LegalProcessFlow;
