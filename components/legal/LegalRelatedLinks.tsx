import Link from "next/link";

type Item = {
  href: string;
  label: string;
  description?: string;
};

type Props = {
  title?: string;
  lead?: string;
  items: Item[];
};

export function LegalRelatedLinks({
  title = "関連する基準",
  lead = "合わせて確認しておくと、運営方針の全体像が見えやすくなります",
  items,
}: Props) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-black/10 bg-[var(--navy)] text-white">
      <div className="border-b border-white/10 px-5 py-5 sm:px-6">
        <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/30">
          RELATED
        </div>
        <h2 className="mt-3 max-w-[16ch] text-[clamp(24px,4vw,36px)] font-semibold leading-[1.05] tracking-[-0.06em] text-white/[0.92]">
          {title}
        </h2>
        <p className="mt-3 max-w-2xl text-[13px] leading-[1.9] tracking-[0.02em] text-white/[0.48]">
          {lead}
        </p>
      </div>

      <div className="grid divide-y divide-white/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group min-h-[116px] px-5 py-5 transition-colors duration-150 hover:bg-white/[0.06] sm:px-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="text-[15px] font-semibold tracking-[-0.02em] text-white/[0.86] transition-colors group-hover:text-white">
                {item.label}
              </div>
              <span className="text-[18px] leading-none text-[var(--teal)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                ↗
              </span>
            </div>
            {item.description ? (
              <p className="mt-3 text-[12px] leading-[1.8] text-white/[0.38] transition-colors group-hover:text-white/[0.52]">
                {item.description}
              </p>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );
}

export default LegalRelatedLinks;
