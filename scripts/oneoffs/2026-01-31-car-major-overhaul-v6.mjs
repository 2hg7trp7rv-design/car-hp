import fs from "fs";
import path from "path";

const repoRoot = process.cwd();
const carsDir = path.join(repoRoot, "data", "articles", "cars");

const appendMap = {
  "mercedes-benz-s-class-w140":
    " 価格の安さに引っ張られず、状態の良い車を選ぶほど結果が良くなります。乗り方は静かに距離を伸ばす方が相性がいいです。",
  "suzuki-alto-works-ha36s":
    " まずはノーマル寄りの状態で楽しみ、必要なら少しずつ手を入れる方が安全です。",
  "suzuki-cappuccino-ea11r":
    " 場合によっては幌とウェザーストリップの状態が、満足度を大きく左右します。",
  "honda-beat-pp1":
    " ミッドシップは冷却の癖が出やすいので、水温の安定も気にしておくと安心です。",
  "mitsubishi-lancer-evolution-vi-gsr":
    " 冷却と油脂類を先に整えると、出費の波が穏やかになります。",
  "nissan-skyline-gtr-r34":
    " 迷ったら、配線や配管の丁寧さが残っている個体を優先すると失敗しにくいです。"
};

let changed = 0;
for (const [slug, add] of Object.entries(appendMap)) {
  const file = path.join(carsDir, `${slug}.json`);
  if (!fs.existsSync(file)) {
    console.error(`missing: ${slug}`);
    continue;
  }
  const car = JSON.parse(fs.readFileSync(file, "utf8"));
  const current = String(car.summaryLong ?? "").trim();
  car.summaryLong = current ? `${current}${add}` : add.trim();
  fs.writeFileSync(file, JSON.stringify(car, null, 2) + "\n", "utf8");
  changed += 1;
}
console.log(`v6 applied: ${changed}`);
