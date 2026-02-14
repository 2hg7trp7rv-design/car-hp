import { renderInlineMarkdown } from "@/components/content/InlineMarkdown";

type Button = {
  label: string;
  href: string;
  external?: boolean;
};

type Props = {
  title: string;
  lead?: string | null;
  buttons: Button[];
};

export function CtaBox({ title, lead, buttons }: Props) {
  return (
    <section className="cta-box" aria-label={title}>
      <h3>{renderInlineMarkdown(title, { tone: "light" })}</h3>
      {lead ? <p>{renderInlineMarkdown(lead, { tone: "light" })}</p> : null}
      <div className="cta-box__buttons">
        {buttons.slice(0, 2).map((b, idx) => (
          <a
            key={idx}
            href={b.href}
            className="cta-button"
            target={b.external ? "_blank" : undefined}
            rel={b.external ? "noopener noreferrer" : undefined}
          >
            {renderInlineMarkdown(b.label, { tone: "light" })}
          </a>
        ))}
      </div>
    </section>
  );
}
