import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import styles from "../simple.module.css";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: `${SITE.name}での個人情報と外部サービスの扱いについて。`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className={`wrap ${styles.page}`}>
      <header className={`sticker ${styles.header}`}>
        <p className={styles.kicker}>サイトの案内</p>
        <h1>プライバシーポリシー</h1>
        <p>最終更新：2026年10月27日</p>
      </header>

      <div className={styles.prose}>
        <h2>集める情報</h2>
        <p>
          このサイトは現在、会員登録や問い合わせフォームを置いていません。アクセス解析や広告のサービスも使っていません。
        </p>

        <h2>共有ボタン</h2>
        <p>
          記事の「Xでシェア」「LINEで送る」を押すと、それぞれのサービスのページが開きます。開いた先での情報の扱いは、各サービスの方針に従います。押さない限り、このサイトから情報は送られません。
        </p>

        <h2>変更について</h2>
        <p>
          アクセス解析や広告などを使い始めるときは、使うサービスと送られる情報をこのページに書き足し、更新日を変えます。
        </p>
      </div>
    </div>
  );
}
