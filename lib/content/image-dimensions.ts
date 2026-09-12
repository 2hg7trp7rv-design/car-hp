import metadata from "@/data/_internal/image-metadata.json";

type Dimensions = { width: number; height: number };
const dimensions: Record<string, Dimensions> = metadata;

/** Build-time metadata keeps public image files out of the server runtime bundle. */
export function imageDimensions(src: string): Dimensions {
  const value = Object.hasOwn(dimensions, src) ? dimensions[src] : undefined;
  if (!value) throw new Error(`Missing dimensions for ${src}. Run npm run images:gen after adding an image.`);
  return value;
}
