import fs from "fs";
import path from "path";

const repoRoot = process.cwd();
const carsDir = path.join(repoRoot, "data", "articles", "cars");

function injectAtEndOfSection(body, heading, extra) {
  const marker = `## ${heading}\n`;
  const idx = body.indexOf(marker);
  if (idx === -1) return body;

  const start = idx + marker.length;
  const next = body.indexOf("\n## ", start);
  if (next === -1) {
    return body.trimEnd() + "\n\n" + extra.trim() + "\n";
  }
  return (
    body.slice(0, next) + "\n\n" + extra.trim() + "\n" + body.slice(next)
  );
}

const additions = {
  "mitsubishi-lancer-evolution-vi-gsr":
    "補足として、エボは同じ年式でもオーナーの使い方で状態が大きく変わります。迷う二台があるなら、足回りと駆動の素直さが残っている方を選ぶと、立て直しの費用が読めます。",
  "nissan-silvia-s15":
    "最後に、購入時は見た目のカスタムより、配線と配管の丁寧さを重視したいです。雑な取り回しの車は小トラブルが連鎖しやすい。細部が綺麗な個体ほど、結果的に安心して踏めます。",
  "toyota-supra-jza80-rz":
    "追加で見るなら燃料系の状態です。年式的にホースやポンプ周りが弱っていると、高負荷時の不調に繋がります。全開を楽しみたい車ほど、燃料と冷却に手当が入っているかを確認したい。",
  "nissan-z-rz34":
    "もう一つのポイントは、保証の引き継ぎと点検窓口です。新しい車ほど電子制御が多く、診断できる環境があるかで安心感が変わります。買う時点で、どこに持ち込むかまで決めておくと迷いが減ります。",
  "suzuki-alto-works-ha36s":
    "軽スポーツは、わずかな癖が走り味に直結します。中古ではステアリングセンターのズレ、タイヤの片減り、ブレーキの片効きを必ず確認。ここが綺麗な個体は、足回りの基礎が整っていることが多く、後から乗り味を作りやすいです。",
  "suzuki-cappuccino-ea11r":
    "さらに、幌とウェザーストリップの状態も重要です。雨漏りがあるとフロアが湿って錆が進みます。幌が綺麗で水の侵入が少ない車は、それだけで価値があると考えて良いです。",
  "honda-beat-pp1":
    "最後に、冷却の履歴が分かる車は安心です。ホースやラジエーターの交換歴、ファンの作動、渋滞で水温が安定するか。ここが整っている個体は、日常でも気兼ねなく乗れます。",
  "autozam-az-1-pg6sa":
    "AZ-1はドア周りの状態が価値を左右します。開閉のスムーズさ、異音、ヒンジのガタ。ここが健康な個体は、保管も丁寧なことが多いので、優先してチェックしたいです。",
  "mercedes-benz-s-class-w140":
    "補足として、W140は部品と工賃の見積もりを先に取るのがおすすめです。壊れてから探すと時間が掛かり、結果的に高くつきます。購入前に主治医を決め、よくある整備の費用感を掴んでおくと、安心して選べます。",
};

let changed = 0;
for (const [slug, extra] of Object.entries(additions)) {
  const filePath = path.join(carsDir, `${slug}.json`);
  if (!fs.existsSync(filePath)) {
    console.warn(`[skip] missing: ${slug}`);
    continue;
  }
  const raw = fs.readFileSync(filePath, "utf8");
  const car = JSON.parse(raw);
  const before = String(car.body ?? "");
  if (!before.trim()) {
    console.warn(`[skip] no body: ${slug}`);
    continue;
  }
  const after = injectAtEndOfSection(before, "中古で買うなら", extra);
  if (after !== before) {
    car.body = after;
    fs.writeFileSync(filePath, JSON.stringify(car, null, 2) + "\n", "utf8");
    changed++;
  }
}

console.log(`car major overhaul v4 applied: ${changed}`);
