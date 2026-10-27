import { loadDefaultJapaneseParser } from "budoux";
import { Fragment } from "react";

const parser = loadDefaultJapaneseParser();

// BudouX が途中で区切ってしまう言葉。この中では改行しない
const KEEP_TOGETHER = ["軽自動車"];

function toPhrases(text: string) {
  const inside = new Set<number>();
  for (const word of KEEP_TOGETHER) {
    for (let at = text.indexOf(word); at !== -1; at = text.indexOf(word, at + 1)) {
      for (let i = at + 1; i < at + word.length; i++) inside.add(i);
    }
  }
  const phrases: string[] = [];
  let pos = 0;
  for (const chunk of parser.parse(text)) {
    if (phrases.length > 0 && inside.has(pos)) phrases[phrases.length - 1] += chunk;
    else phrases.push(chunk);
    pos += chunk.length;
  }
  return phrases;
}

// 日本語の文を BudouX で文節に分け、区切りに <wbr> を入れる。
// 文節の中では折り返さない（globals.css の .phrases）ので、Chrome だけが対応する
// word-break: auto-phrase と違い、iPhone の Safari でも言葉の途中で改行されない。
// BudouX はサーバーで動くだけで、ブラウザへは送らない。
export function Phrases({ children }: { children: string }) {
  return (
    <span className="phrases">
      {toPhrases(children).map((phrase, i) => (
        <Fragment key={i}>
          {i > 0 && <wbr />}
          {phrase}
        </Fragment>
      ))}
    </span>
  );
}
