type SummaryItem = {
  label: string;
  title: string;
  body: string;
};

type Props = {
  items: SummaryItem[];
  className?: string;
};

export function LegalSummaryGrid({ items, className = "" }: Props) {
  return (
    <section className={className}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article
            key={`${item.label}-${item.title}`}
            className="rounded-[22px] border border-black/10 bg-[#f9f5ee] p-4 sm:p-5"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#00708d]">
              {item.label}
            </p>
            <h3 className="mt-3 text-[17px] font-semibold leading-[1.25] tracking-[-0.04em] text-[#080b0d]">
              {item.title}
            </h3>
            <p className="mt-2 text-[12px] leading-[1.85] text-[#657078]">
              {item.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default LegalSummaryGrid;
