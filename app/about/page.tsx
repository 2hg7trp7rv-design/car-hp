import type { Metadata } from "next";
import { Talk } from "@/components/Talk";
import { Phrases } from "@/components/Phrases";
import { SITE } from "@/lib/site";
import styles from "../simple.module.css";

export const metadata: Metadata = {
  title: "サイトについて",
  description: `${SITE.name}が誰のためのサイトで、どのように記事を作っているかを説明します。`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className={`wrap ${styles.page}`}>
      <header className={`sticker ${styles.header}`}>
        <p className={styles.kicker}>サイトについて</p>
        <h1>{SITE.name}</h1>
        <p>
          <Phrases>{SITE.description}</Phrases>
        </p>
      </header>

      <div className={styles.empty}>
        <Talk who="shuna" text="このサイト、だれが書いてるの？" />
        <Talk who="rina" text="編集部が、公的な資料やメーカーの資料を確かめながら書いているよ。私たちふたりは、説明のための案内役なんだ。" />
      </div>

      <div className={styles.prose}>
        <h2>誰のためのサイトか</h2>
        <p>
          <Phrases>
            免許をとったばかりの人や、これからクルマを持つ人のためのサイトです。専門用語はできるだけ使わず、使うときは意味を説明します。
          </Phrases>
        </p>

        <h2>記事の作り方</h2>
        <ul>
          <li>
            <Phrases>手順や決まりは、官公庁・消防・メーカーなどの資料で確かめます。</Phrases>
          </li>
          <li>
            <Phrases>確かめた資料は、記事の最後に「確認した資料」として載せます。</Phrases>
          </li>
          <li>
            <Phrases>クルマごとに違うことは、取扱説明書やお店の表示で確かめるよう案内します。</Phrases>
          </li>
          <li>
            <Phrases>まちがいに気づいたら、記事を直して更新日を変えます。</Phrases>
          </li>
        </ul>

        <h2>シュナと莉奈について</h2>
        <p>
          <Phrases>
            ふたりは、このサイトの説明のために作った架空のキャラクターです。実在の人物や、資格を持つ専門家ではありません。イラストは生成AIで作成しています。
          </Phrases>
        </p>
      </div>
    </div>
  );
}
