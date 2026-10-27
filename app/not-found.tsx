import type { Metadata } from "next";
import Link from "next/link";
import { Talk } from "@/components/Talk";
import styles from "./simple.module.css";

export const metadata: Metadata = {
  title: "ページが見つかりません",
};

export default function NotFound() {
  return (
    <div className={`wrap ${styles.page}`}>
      <div className={styles.empty}>
        <Talk who="shuna" text="あれ？ このページ、見つからないみたい…。" />
        <Talk who="rina" text="URLが変わったか、まだないページかも。トップから探してみよう。" />
        <p>
          <Link href="/" className="button">
            トップへ戻る
          </Link>
        </p>
      </div>
    </div>
  );
}
