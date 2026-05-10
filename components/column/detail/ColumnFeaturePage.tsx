import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";
import { PullQuote } from "@/components/content/PullQuote";
import { InThisStoryToc } from "@/components/content/InThisStoryToc";
import { TextWithInternalLinkCards } from "@/components/content/TextWithInternalLinkCards";
import { ContentGridCard } from "@/components/content/ContentGridCard";
import { ContentRowCard } from "@/components/content/ContentRowCard";
import { JsonLd } from "@/components/seo/JsonLd";

import { getSiteUrl } from "@/lib/site";
import { resolveEditorialImage } from "@/lib/editorial-media";
import { resolveColumnDisplayTag } from "@/lib/display-tags";
import { resolveColumnCardImage } from "@/lib/display-tag-media";
import { getEditorialSurfaceClass } from "@/lib/detail-theme";

import type { ColumnItem } from "@/lib/columns";
import type {
  ColumnFeatureBlock,
  ColumnFeatureLink,
  ColumnFeaturePayload,
} from "@/lib/content-types";

type FeatureLink = ColumnFeatureLink;

type FeatureBlock = ColumnFeatureBlock;

type FeaturePayload = ColumnFeaturePayload;

type FeatureColumnItem = ColumnItem & {
  layoutVariant?: string | null;
  featureV1?: FeaturePayload | null;
};

type Props = {
  item: FeatureColumnItem;
  related: ColumnItem[];
  linkIndex: Record<string, unknown>;
};

function formatDateLabel(value?: string | null) {
  if (!value) return null;
  const t = Date.parse(value);
  if (!Number.isFinite(t)) return value;
  const d = new Date(t);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function toneLabel(tone?: string | null) {
  switch ((tone ?? "").trim()) {
    case "warning":
      return "注意";
    case "tip":
      return "ヒント";
    default:
      return "補足";
  }
}

function renderListItem(text: string, linkIndex: Record<string, unknown>, key: string) {
  return (
    <li key={key} className="text-[15px] leading-7 text-[var(--text-secondary)]">
      <TextWithInternalLinkCards
        text={text}
        linkIndex={linkIndex as any}
        as="span"
        textClassName="cb-stage-body"
        className="inline"
      />
    </li>
  );
}

function renderActionLinks(items: FeatureLink[], variant: "card" | "button" = "card") {
  if (!items.length) return null;

  if (variant === "button") {
    return (
      <div className="mt-5 flex flex-wrap gap-3">
        {items.map((entry) => (
          <Link
            key={`${entry.href}-${entry.title}`}
            href={entry.href}
            className="detail-button-secondary"
          >
            {entry.title}
            <span aria-hidden>→</span>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      {items.map((entry) => (
        <Link
          key={`${entry.href}-${entry.title}`}
          href={entry.href}
          className="rounded-[20px] border border-[rgba(31,28,25,0.08)] bg-[rgba(255,255,255,0.78)] p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(20,18,16,0.08)]"
        >
          <p className="text-[11px] font-semibold tracking-[0.18em] text-[var(--text-tertiary)]">
            {(entry.label ?? "関連ページ").toString()}
          </p>
          <h3 className="mt-2 text-[15px] font-semibold leading-6 tracking-[-0.02em] text-[var(--text-primary)]">
            {entry.title}
          </h3>
          <p className="mt-3 text-[13px] text-[var(--text-secondary)]">読む →</p>
        </Link>
      ))}
    </div>
  );
}

function renderBlock(
  block: FeatureBlock,
  index: number,
  linkIndex: Record<string, unknown>,
): ReactNode {
  if (block.type === "paragraph") {
    return (
      <TextWithInternalLinkCards
        key={`paragraph-${index}`}
        text={block.text}
        linkIndex={linkIndex as any}
        textClassName="cb-stage-body"
        className="space-y-3"
      />
    );
  }

  if (block.type === "list") {
    const ListTag = block.ordered ? "ol" : "ul";
    return (
      <ListTag
        key={`list-${index}`}
        className={`space-y-3 ${block.ordered ? "pl-6 list-decimal" : "pl-5 list-disc marker:text-[var(--accent-strong)]"}`}
      >
        {block.items.map((item, itemIndex) =>
          renderListItem(item, linkIndex, `list-${index}-${itemIndex}`),
        )}
      </ListTag>
    );
  }

  if (block.type === "quote") {
    return <PullQuote key={`quote-${index}`} text={block.text} />;
  }

  if (block.type === "callout") {
    return (
      <section key={`callout-${index}`} className="detail-card-muted p-5 sm:p-6">
        <p className="detail-kicker">{toneLabel(block.tone)}</p>
        <h3 className="mt-2 text-[19px] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
          {block.title}
        </h3>
        <div className="mt-3">
          <TextWithInternalLinkCards
            text={block.body}
            linkIndex={linkIndex as any}
            textClassName="cb-stage-body"
          />
        </div>
      </section>
    );
  }

  if (block.type === "cards") {
    return (
      <div key={`cards-${index}`} className="grid gap-3 sm:grid-cols-2">
        {block.items.map((card, cardIndex) => (
          <section
            key={`card-${index}-${cardIndex}`}
            className="rounded-[20px] border border-[rgba(31,28,25,0.08)] bg-[rgba(255,255,255,0.72)] p-5"
          >
            <h3 className="text-[16px] font-semibold leading-6 tracking-[-0.02em] text-[var(--text-primary)]">
              {card.title}
            </h3>
            {card.body ? (
              <div className="mt-3">
                <TextWithInternalLinkCards
                  text={card.body}
                  linkIndex={linkIndex as any}
                  textClassName="cb-stage-body"
                />
              </div>
            ) : null}
            {card.items && card.items.length > 0 ? (
              <ul className="mt-4 space-y-2 pl-5 list-disc marker:text-[var(--accent-strong)]">
                {card.items.map((entry, entryIndex) =>
                  renderListItem(entry, linkIndex, `card-${index}-${cardIndex}-${entryIndex}`),
                )}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    );
  }

  if (block.type === "steps") {
    return (
      <div key={`steps-${index}`} className="space-y-4">
        {block.items.map((step, stepIndex) => (
          <div
            key={`step-${index}-${stepIndex}`}
            className="grid grid-cols-[40px_minmax(0,1fr)] gap-4 rounded-[20px] border border-[rgba(31,28,25,0.08)] bg-[rgba(255,255,255,0.74)] p-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-subtle)] text-[13px] font-semibold text-[var(--accent-strong)]">
              {String(stepIndex + 1).padStart(2, "0")}
            </div>
            <div>
              <h3 className="text-[16px] font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
                {step.title}
              </h3>
              <div className="mt-2">
                <TextWithInternalLinkCards
                  text={step.body}
                  linkIndex={linkIndex as any}
                  textClassName="cb-stage-body"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (block.type === "linkCards") {
    return (
      <div key={`links-${index}`}>
        {renderActionLinks(block.items, "card")}
      </div>
    );
  }

  return null;
}

export function ColumnFeaturePage({ item, related, linkIndex }: Props) {
  const feature = item.featureV1;
  if (!feature) return null;

  const title = item.titleJa ?? item.title;
  const badge = resolveColumnDisplayTag(item);
  const updatedLabel = formatDateLabel(item.updatedAt ?? item.publishedAt ?? item.createdAt ?? null);
  const heroMedia = resolveEditorialImage(
    ((item.heroImage ?? (item as any).ogImageUrl ?? null) as string | null),
    "column",
    "desktop",
    item.slug,
  );
  const safeHeroImage = heroMedia.src;
  const sectionList = Array.isArray(feature.sections) ? feature.sections : [];
  const tocItems =
    feature.toc?.enabled === false
      ? []
      : sectionList.map((section) => ({
          id: section.id,
          title: section.title,
        }));
  const summaryTitle = feature.summaryPanel?.title?.trim() || "要点";
  const summaryItems = feature.summaryPanel?.items ?? [];
  const updateHistory = feature.updateHistory ?? [];
  const sourceList = feature.sources ?? [];
  const curatedRelated = feature.related?.articles ?? [];
  const relatedLead = related.slice(0, 2);
  const relatedRows = related.slice(2, 4);
  const articleUrl = `${getSiteUrl()}/column/${encodeURIComponent(item.slug)}`;

  return (
    <main className="detail-page">
      <JsonLd
        id={`ld-breadcrumb-column-${item.slug}`}
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "ホーム",
              item: `${getSiteUrl()}/`,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "視点",
              item: `${getSiteUrl()}/column`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: title,
              item: articleUrl,
            },
          ],
        }}
      />
      <JsonLd
        id={`ld-article-column-${item.slug}`}
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title,
          description: item.seoDescription ?? item.summary ?? title,
          datePublished: item.publishedAt ?? item.createdAt ?? undefined,
          dateModified: item.updatedAt ?? item.publishedAt ?? item.createdAt ?? undefined,
          mainEntityOfPage: articleUrl,
          image: safeHeroImage ? [`${getSiteUrl()}${safeHeroImage.startsWith("/") ? safeHeroImage : `/${safeHeroImage}`}`] : undefined,
          author: {
            "@type": "Organization",
            name: "CAR BOUTIQUE JOURNAL",
          },
          publisher: {
            "@type": "Organization",
            name: "CAR BOUTIQUE JOURNAL",
          },
        }}
      />
      <DetailFixedBackground
        seed={item.slug}
        imageSrc={(item.heroImage ?? (item as any).ogImageUrl ?? null) as string | null}
      />
      <div id="top" />

      <div className="detail-shell pb-24 pt-24 sm:pt-28">
        <Breadcrumb
          tone="paper"
          items={[
            { label: "ホーム", href: "/" },
            { label: "視点", href: "/column" },
            { label: title },
          ]}
        />

        <section className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] lg:items-end">
          <div className="order-1">
            <div className="detail-photo-frame relative aspect-[16/10] w-full">
              {safeHeroImage ? (
                <Image
                  src={safeHeroImage}
                  alt={title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(min-width: 1024px) 56vw, 100vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-[rgba(31,28,25,0.06)] text-[13px] text-[var(--text-secondary)]">
                  視点
                </div>
              )}
            </div>
          </div>

          <div className="order-2">
            <div className="flex flex-wrap items-center gap-2">
              {badge ? <span className="detail-chip-accent">{badge}</span> : null}
              {updatedLabel ? (
                <span className="detail-chip-neutral">{updatedLabel} 更新</span>
              ) : null}
            </div>
            <h1 className="page-title mt-4">{title}</h1>
            {(item.subtitle ?? item.summary) ? (
              <p className="detail-lead mt-6 max-w-[40rem]">
                {(item.subtitle ?? item.summary ?? "").trim()}
              </p>
            ) : null}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/column" className="detail-button-secondary">
                視点へ
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>

        {summaryItems.length > 0 ? (
          <section className="mt-8">
            <section className="detail-card-clay p-6 sm:p-8">
              <p className="detail-kicker">{summaryTitle}</p>
              <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                まず押さえる論点
              </h2>
              <ul className="mt-5 space-y-3 pl-5 list-disc marker:text-[var(--accent-strong)]">
                {summaryItems.map((entry, entryIndex) =>
                  renderListItem(entry, linkIndex, `summary-${entryIndex}`),
                )}
              </ul>
            </section>
          </section>
        ) : null}

        {feature.introQuote ? (
          <section className="mt-8">
            <PullQuote text={feature.introQuote} />
          </section>
        ) : null}

        {tocItems.length > 1 ? (
          <section className="mt-10">
            <InThisStoryToc items={tocItems} sticky ariaLabel="ページ内目次" />
          </section>
        ) : null}

        <article className="mt-12 space-y-8">
          {sectionList.map((section, secIndex) => (
            <section
              key={section.id}
              id={section.id}
              className={`${getEditorialSurfaceClass(secIndex)} scroll-mt-28 overflow-hidden`}
            >
              <div className="cb-stage-chapterTop">
                <div className="flex items-baseline gap-3 px-6 py-5 sm:px-8">
                  <p className="cb-stage-chapterLabel">
                    <span className="cb-stage-chapterNumber">
                      {(section.number ?? String(secIndex + 1).padStart(2, "0")).toString()}
                    </span>
                    .
                  </p>
                  <h2 className="cb-stage-chapterTitle">{section.title}</h2>
                </div>
                <div className="mx-6 h-px bg-[rgba(31,28,25,0.08)]" />
              </div>

              <div className="space-y-5 px-6 py-6 sm:px-8 sm:py-7">
                {section.blocks.map((block, blockIndex) =>
                  renderBlock(block, blockIndex, linkIndex),
                )}
              </div>
            </section>
          ))}
        </article>

        {feature.actionBox ? (
          <section className="mt-10 detail-card-slate p-6 sm:p-8">
            <p className="detail-kicker">今すぐやること</p>
            <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
              {feature.actionBox.title}
            </h2>
            <div className="mt-4">
              <TextWithInternalLinkCards
                text={feature.actionBox.body}
                linkIndex={linkIndex as any}
                textClassName="cb-stage-body"
              />
            </div>
            {feature.actionBox.actions && feature.actionBox.actions.length > 0
              ? renderActionLinks(feature.actionBox.actions, "button")
              : null}
          </section>
        ) : null}

        {(updateHistory.length > 0 || sourceList.length > 0) ? (
          <section className="mt-10 grid gap-6 lg:grid-cols-2">
            {updateHistory.length > 0 ? (
              <section className="detail-card-muted p-6">
                <h2 className="text-[20px] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                  更新履歴
                </h2>
                <ul className="mt-4 space-y-3">
                  {updateHistory.map((entry, index) => (
                    <li key={`update-${index}`} className="text-[14px] leading-7 text-[var(--text-secondary)]">
                      <span className="font-medium text-[var(--text-primary)]">{entry.date}：</span>
                      {entry.text}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {sourceList.length > 0 ? (
              <section className="detail-card-muted p-6">
                <h2 className="text-[20px] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                  出典・参考資料
                </h2>
                <ul className="mt-4 space-y-3">
                  {sourceList.map((entry, index) => (
                    <li key={`source-${index}`} className="text-[14px] leading-7 text-[var(--text-secondary)] break-words">
                      <a
                        href={entry.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline decoration-[rgba(31,28,25,0.22)] underline-offset-4 hover:text-[var(--text-primary)]"
                      >
                        {entry.label?.trim() || entry.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </section>
        ) : null}

        {(related.length > 0 || curatedRelated.length > 0) ? (
          <section className="mt-12">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="detail-kicker">関連記事</p>
                <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                  このまま迷いを潰す
                </h2>
              </div>
              <Link href="/column" className="detail-button-secondary">
                視点へ
                <span aria-hidden>→</span>
              </Link>
            </div>

            {curatedRelated.length > 0 ? (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {curatedRelated.map((entry) => (
                  <Link
                    key={`${entry.href}-${entry.title}`}
                    href={entry.href}
                    className="rounded-[20px] border border-[rgba(31,28,25,0.08)] bg-[rgba(255,255,255,0.78)] p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(20,18,16,0.08)]"
                  >
                    <p className="text-[11px] font-semibold tracking-[0.18em] text-[var(--text-tertiary)]">
                      {(entry.label ?? "関連視点").toString()}
                    </p>
                    <h3 className="mt-2 text-[16px] font-semibold leading-6 tracking-[-0.02em] text-[var(--text-primary)]">
                      {entry.title}
                    </h3>
                    <p className="mt-3 text-[13px] text-[var(--text-secondary)]">読む →</p>
                  </Link>
                ))}
              </div>
            ) : null}

            {related.length > 0 ? (
              <>
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  {relatedLead.map((entry) => (
                    <ContentGridCard
                      key={entry.slug}
                      href={`/column/${encodeURIComponent(entry.slug)}`}
                      title={entry.titleJa ?? entry.title}
                      date={formatDateLabel(entry.publishedAt ?? entry.updatedAt ?? entry.createdAt ?? null) ?? undefined}
                      imageSrc={resolveColumnCardImage(entry) ?? "/images/heritage/hero_default.jpg"}
                      eyebrow={resolveColumnDisplayTag(entry)}
                      seedKey={entry.slug}
                      posterVariant="column"
                    />
                  ))}
                </div>

                {relatedRows.length > 0 ? (
                  <div className="mt-6 space-y-3">
                    {relatedRows.map((entry) => (
                      <ContentRowCard
                        key={entry.slug}
                        href={`/column/${encodeURIComponent(entry.slug)}`}
                        title={entry.titleJa ?? entry.title}
                        excerpt={entry.summary ?? null}
                        imageSrc={resolveColumnCardImage(entry) ?? "/images/heritage/hero_default.jpg"}
                        badge={resolveColumnDisplayTag(entry)}
                        badgeTone="accent"
                        date={formatDateLabel(entry.publishedAt ?? entry.updatedAt ?? entry.createdAt ?? null) ?? null}
                        size="sm"
                        posterVariant="column"
                      />
                    ))}
                  </div>
                ) : null}
              </>
            ) : null}
          </section>
        ) : null}

        <div className="mt-14 flex flex-wrap gap-3">
          <Link href="#top" className="detail-button-secondary">
            TOPへ戻る
            <span aria-hidden>↑</span>
          </Link>
          <Link href="/column" className="detail-button-secondary">
            視点を見る
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
