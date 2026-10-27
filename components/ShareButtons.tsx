"use client";

import { useState } from "react";
import styles from "./article.module.css";

export function ShareButtons({ url, text }: { url: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const xHref = `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  const lineHref = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={styles.share}>
      <p className={styles.shareTitle}>役に立ったら、シェアしてね</p>
      <div className={styles.shareButtons}>
        <a href={xHref} target="_blank" rel="noopener noreferrer" data-s="x">
          Xでシェア
        </a>
        <a href={lineHref} target="_blank" rel="noopener noreferrer" data-s="line">
          LINEで送る
        </a>
        <button type="button" onClick={copy} data-s="copy">
          {copied ? "コピーしました" : "リンクをコピー"}
        </button>
      </div>
    </div>
  );
}
