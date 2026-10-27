import type { Block } from "@/content/types";
import { FIGURES } from "./figures";
import { Talk } from "./Talk";
import styles from "./article.module.css";

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "talk":
      return <Talk who={block.who} text={block.text} />;
    case "text":
      return <p className={styles.text}>{block.text}</p>;
    case "figure": {
      const Figure = FIGURES[block.figure];
      return (
        <figure className={`sticker ${styles.figure}`}>
          <Figure />
          <figcaption>{block.caption}</figcaption>
        </figure>
      );
    }
    case "steps":
      return (
        <ol className={styles.steps}>
          {block.items.map((item, i) => (
            <li key={item.title} className="sticker">
              <span className={styles.stepNo} aria-hidden="true">
                {i + 1}
              </span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      );
    case "point":
      return (
        <aside className={`sticker ${styles.point}`}>
          <span className={styles.boxLabel}>ここがポイント</span>
          <h3>{block.title}</h3>
          <p>{block.text}</p>
        </aside>
      );
    case "ng":
      return (
        <aside className={`sticker ${styles.ng}`} aria-label={block.title}>
          <span className={styles.boxLabel}>やっちゃダメ</span>
          <ul>
            {block.items.map((item) => (
              <li key={item.title}>
                <span className={styles.ngMark} aria-hidden="true">
                  ×
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      );
  }
}

export function ArticleBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className={styles.blocks}>
      {blocks.map((block, i) => (
        <BlockView key={i} block={block} />
      ))}
    </div>
  );
}
