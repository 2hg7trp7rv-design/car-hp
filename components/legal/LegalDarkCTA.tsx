import Link from "next/link";

type Props = {
  eyebrow?: string;
  title: string;
  body: string;
  href: string;
  label: string;
};

export function LegalDarkCTA({ eyebrow = "CONTACT", title, body, href, label }: Props) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-black/10 bg-[var(--navy)] text-white">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-stretch">
        <div className="p-5 sm:p-6">
          <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/30">
            {eyebrow}
          </div>
          <h2 className="mt-3 max-w-[18ch] text-[clamp(24px,4vw,38px)] font-semibold leading-[1.06] tracking-[-0.06em] text-white/[0.92]">
            {title}
          </h2>
          <p className="mt-4 max-w-2xl text-[13px] leading-[1.9] text-white/[0.46]">
            {body}
          </p>
        </div>
        <div className="border-t border-white/10 p-5 lg:grid lg:min-w-[220px] lg:place-items-center lg:border-l lg:border-t-0">
          <Link href={href} className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-[13px] font-semibold text-[var(--navy)] transition-colors hover:bg-white/[0.88]">
            {label} ↗
          </Link>
        </div>
      </div>
    </section>
  );
}

export default LegalDarkCTA;
