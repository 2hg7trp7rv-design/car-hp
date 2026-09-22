import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  AMAZON_DISCLOSURE,
  getAmazonSearchOffer,
  getServiceOffer,
  type AmazonOfferKey,
  type ServiceOfferKey,
} from "@/lib/commerce";
import { AmazonSearchLink } from "./AmazonSearchLink";
import { ServiceLink } from "./ServiceLink";
import styles from "@/app/choose/choose.module.css";

export function ChoiceHeader({ title, theme, description, learningHref, learningLabel }: {
  title: string; theme: string; description: string; learningHref: string; learningLabel: string;
}) {
  return <>
    <nav className={styles.breadcrumb} aria-label="パンくず"><Link href="/">ホーム</Link><Link href="/choose">選ぶ</Link><span aria-current="page">{title}</span></nav>
    <header className={styles.heading}>
      <p className={styles.kicker}>{theme} · 条件から選ぶ</p>
      <h1>{title}の選び方</h1><p className={styles.lead}>{description}</p>
      <p className={styles.meta}>CAR BOUTIQUE JOURNAL編集部 · 資料確認 <time dateTime="2026-09-22">2026.09.22</time></p>
    </header>
    <p className={styles.learningLink}><span>しくみから知りたいときは</span><Link href={learningHref}>{learningLabel} →</Link></p>
    <nav className={styles.contents} aria-label="このページの目次"><a href="#conditions">必要な条件</a><a href="#compare">比較するポイント</a><a href="#next">候補を探す前に</a></nav>
  </>;
}

export function CriteriaTable({ caption, headers, rows }: { caption: string; headers: string[]; rows: string[][] }) {
  return <div className={styles.tableScroll} tabIndex={0} role="region" aria-label={`${caption}（横にスクロールできます）`}>
    <table><caption>{caption}</caption><thead><tr>{headers.map(header => <th key={header} scope="col">{header}</th>)}</tr></thead>
      <tbody>{rows.map(row => <tr key={row[0]}>{row.map((cell, index) => index === 0 ? <th key={index} scope="row">{cell}</th> : <td key={index}>{cell}</td>)}</tr>)}</tbody>
    </table>
  </div>;
}

export function AmazonCandidates({ offerKey, contentId, description }: { offerKey: AmazonOfferKey; contentId: string; description: string }) {
  const offer = getAmazonSearchOffer(offerKey);
  if (!offer) return null;
  return <div className={styles.candidates}>
    <p className={styles.kicker}>広告 · Amazonアソシエイト</p>
    <h3>決めた条件で、商品候補を探す</h3><p>{description}</p>
    <AmazonSearchLink offer={offer} contentId={contentId} className={styles.amazonLink} />
    <p className={styles.disclosure}>{AMAZON_DISCLOSURE}</p>
  </div>;
}

export function ChoiceSources({ sources }: { sources: { title: string; href: string; note: string }[] }) {
  return <section className={styles.sources} aria-labelledby="choice-sources"><h2 id="choice-sources">確認したメーカー資料</h2>
    <p>仕様と使い方の根拠を確認できます。製品ごとの条件は、購入する型番の取扱説明書と適合情報で確かめてください。</p>
    <ul>{sources.map(source => <li key={source.href}><a href={source.href}>{source.title} ↗</a><span>{source.note}</span></li>)}</ul>
  </section>;
}

export function ChoiceTalk({ lines }: { lines: { speaker: "shuna" | "rina"; text: string }[] }) {
  return <div className={styles.talk}>
    {lines.map((line, index) => <div key={index} className={styles.talkLine} data-speaker={line.speaker}>
      <Image src={`/images/cbj/learning/${line.speaker}.webp`} alt="" width={56} height={56} sizes="56px" />
      <p><strong>{line.speaker === "shuna" ? "シュナ" : "莉奈"}</strong>{line.text}</p>
    </div>)}
  </div>;
}

export function ChoiceFigure({ caption, note, children }: { caption: string; note: string; children: ReactNode }) {
  return <figure className={styles.figure} tabIndex={0} role="region" aria-label={`${caption}（横にスクロールできます）`}>
    <figcaption>{caption}</figcaption>
    {children}
    <p className={styles.note}>{note}</p>
  </figure>;
}

export function ServiceCandidates({ offerKey, contentId, heading, description, label, note }: {
  offerKey: ServiceOfferKey; contentId: string; heading: string; description: string; label: string; note: string;
}) {
  const offer = getServiceOffer(offerKey);
  if (!offer) return null;
  return <div className={styles.candidates}>
    <p className={styles.kicker}>{offer.sponsored ? "広告 · PR" : "参考リンク"}</p>
    <h3>{heading}</h3><p>{description}</p>
    <ServiceLink offer={offer} label={label} contentId={contentId} className={styles.amazonLink} />
    <p className={styles.disclosure}>{note}</p>
  </div>;
}
