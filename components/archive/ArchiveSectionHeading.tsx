import { cn } from "@/lib/utils";

type Props = {
  eyebrow: string;
  title: string;
  lead?: string;
  aside?: string;
  className?: string;
};

export function ArchiveSectionHeading({ eyebrow, title, lead, aside, className }: Props) {
  return (
    <div
      className={cn(
        "mb-8 grid gap-4 border-t border-[rgba(31,28,25,0.08)] pt-10 first:border-t-0 first:pt-0 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-end",
        className,
      )}
    >
      <div>
        <p className="cb-kicker">{eyebrow}</p>
        <h2 className="mt-3 text-[30px] font-semibold leading-[1.1] tracking-[-0.05em] text-[var(--text-primary)] sm:text-[38px]">
          {title}
        </h2>
      </div>

      {(lead || aside) ? (
        <div className="max-w-[42rem] justify-self-start lg:justify-self-end">
          {lead ? (
            <p className="text-[15px] leading-[1.9] text-[var(--text-secondary)]">{lead}</p>
          ) : null}
          {aside ? (
            <p className="mt-3 text-[12px] leading-[1.85] text-[var(--text-tertiary)]">{aside}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default ArchiveSectionHeading;
