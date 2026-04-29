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
  lead = "合わせて確認しておくと、運営方針の全体像が見えやすくなります。",
  items,
}: Props) {
  return (
    <section className="rounded-[26px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.78)] p-5 sm:p-6">
      <div className="text-[10px] font-semibold tracking-[0.22em] text-[var(--text-tertiary)] uppercase">
        関連リンク
      </div>
      <h2 className="mt-3 text-[24px] font-semibold leading-[1.2] tracking-[-0.04em] text-[var(--text-primary)]">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-[14px] leading-[1.9] text-[var(--text-secondary)]">
        {lead}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-[20px] border border-[var(--border-default)] bg-[rgba(251,248,243,0.92)] px-4 py-4 transition-colors duration-150 hover:border-[rgba(27,63,229,0.28)] hover:bg-[var(--surface-2)]"
          >
            <div className="text-[15px] font-medium tracking-[-0.02em] text-[var(--text-primary)]">
              {item.label}
            </div>
            {item.description ? (
              <p className="mt-2 text-[13px] leading-[1.8] text-[var(--text-secondary)]">
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
