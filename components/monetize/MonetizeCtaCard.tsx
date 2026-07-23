// components/monetize/MonetizeCtaCard.tsx
"use client";

/**
 * マネタイズCTAカード
 *
 * - 記事デザインシステムの actionBox（ピンク→オレンジグラデーション）と同じ見た目
 * - ENABLE_MONETIZATION が true のときだけ表示（呼び出し側でもゲートする）
 * - 外部リンクには必ず rel="nofollow sponsored noopener noreferrer" を付与する（景表法・SEO対策）
 * - url が "#"（プレースホルダー）の場合はクリックできない状態で表示する
 */

import { trackAffiliateClick } from "@/lib/analytics/events";
import { ENABLE_MONETIZATION } from "@/lib/feature-flags";
import { isPlaceholderPartner, type MonetizePartner } from "@/lib/monetize";

import styles from "@/components/articleDesignSystem/article-design-system.module.css";

const EXTERNAL_REL = "nofollow sponsored noopener noreferrer";

type MonetizeCtaCardProps = {
  partner: MonetizePartner;
  /** 例: "decide_hub_sell" / "article_top" など設置位置の識別子 */
  position: string;
  /** 記事ページでは記事ID、/decide では "decide_hub" など */
  contentId: string;
  /** ページ種別（GA4 page_type に載せる） */
  pageType?: string;
  eyebrow?: string;
  heading: string;
  body: string;
  /** 保険カテゴリ等の注記 */
  note?: string;
};

export function MonetizeCtaCard({
  partner,
  position,
  contentId,
  pageType = "other",
  eyebrow = "PR",
  heading,
  body,
  note,
}: MonetizeCtaCardProps) {
  if (!ENABLE_MONETIZATION) return null;

  const placeholder = isPlaceholderPartner(partner);
  const href = placeholder ? undefined : partner.url;

  function handleClick() {
    trackAffiliateClick({
      partner: partner.id,
      position,
      content_id: contentId,
      page_type: pageType,
      url: partner.url,
    });
  }

  return (
    <aside className={styles.actionBox} data-monetize-cta={partner.id}>
      <span>{eyebrow}</span>
      <h2>{heading}</h2>
      <p>{body}</p>
      {note ? (
        <p style={{ marginTop: 8, fontSize: ".72rem", color: "rgba(255,255,255,.72)" }}>
          {note}
        </p>
      ) : null}
      <div>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel={EXTERNAL_REL}
            onClick={handleClick}
          >
            {partner.ctaLabel} ↗
          </a>
        ) : (
          <a
            href="#"
            aria-disabled="true"
            onClick={(event) => event.preventDefault()}
            style={{ opacity: 0.65, cursor: "default" }}
          >
            {partner.ctaLabel}（準備中）
          </a>
        )}
      </div>
    </aside>
  );
}
