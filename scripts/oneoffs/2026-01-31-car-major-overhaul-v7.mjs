import fs from "fs";
import path from "path";

const repoRoot = process.cwd();
const carsDir = path.join(repoRoot, "data", "articles", "cars");

const appendMap = {
  "mercedes-benz-s-class-w140": " 静かな高速巡航が一番似合います。",
  "suzuki-alto-works-ha36s": " 無理な弄りより基礎整備が効きます。",
};

let touched = 0;
for (const [slug, extra] of Object.entries(appendMap)) {
  const file = path.join(carsDir, `${slug}.json`);
  if (!fs.existsSync(file)) throw new Error(`missing car json: ${slug}`);
  const car = JSON.parse(fs.readFileSync(file, "utf8"));
  const current = String(car.summaryLong ?? "");
  if (!current) throw new Error(`summaryLong missing: ${slug}`);
  car.summaryLong = current.endsWith(extra.trim()) ? current : current + extra;
  fs.writeFileSync(file, JSON.stringify(car, null, 2) + "\n");
  touched++;
}

console.log(`car major overhaul v7 applied: ${touched}`);
