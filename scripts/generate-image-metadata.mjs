import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve("public");
const files = (await fs.readdir(root, { recursive: true }))
  .filter((file) => /\.(?:avif|gif|jpe?g|png|webp)$/i.test(file))
  .sort();
const dimensions = {};
for (const file of files) {
  const { autoOrient } = await sharp(path.join(root, file)).metadata();
  if (!autoOrient?.width || !autoOrient.height) throw new Error(`Missing image dimensions: ${file}`);
  dimensions[`/${file.split(path.sep).join("/")}`] = { width: autoOrient.width, height: autoOrient.height };
}
await fs.mkdir("data/_internal", { recursive: true });
await fs.writeFile("data/_internal/image-metadata.json", `${JSON.stringify(dimensions, null, 2)}\n`);
console.log(`[image-metadata] ${files.length} local images measured`);
