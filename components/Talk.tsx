import Image from "next/image";
import { CHARACTERS, type Speaker } from "@/lib/characters";
import { Phrases } from "./Phrases";
import styles from "./article.module.css";

export function Talk({ who, text, large = false }: { who: Speaker; text: string; large?: boolean }) {
  const c = CHARACTERS[who];
  return (
    <div className={`${styles.talk} ${large ? styles.talkLarge : ""}`} data-who={who}>
      <div className={styles.avatar}>
        <Image src={c.image} alt="" width={160} height={160} sizes={large ? "96px" : "64px"} />
      </div>
      <div className={styles.bubbleWrap}>
        <span className={styles.speaker} data-c={c.color}>
          {c.name}
        </span>
        <p className={styles.bubble}>
          <Phrases>{text}</Phrases>
        </p>
      </div>
    </div>
  );
}
