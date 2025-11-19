// lib/cars.ts
import { notion, getDatabaseIdByTitle } from "./notion";

export type Car = {
  id: string;
  name: string;
  slug: string;
  maker: string | null;
  releaseYear: number | null;
  difficulty: "basic" | "advanced" | null;
};

export async function getAllCars(): Promise<Car[]> {
  const databaseId = await getDatabaseIdByTitle("cars");

  // release_year でソートしたいが、
  // プロパティが無くても落ちないように try/catch でフォールバック
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [
        {
          property: "release_year",
          direction: "descending",
        },
      ],
    });

    return mapCars(response.results);
  } catch (error: any) {
    console.warn("cars: sort by release_year failed, fallback to created_time", error);

    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [
        {
          timestamp: "created_time",
          direction: "descending",
        },
      ],
    });

    return mapCars(response.results);
  }
}

function mapCars(pages: any[]): Car[] {
  return pages.map((page: any) => {
    const props = page.properties;

    const titleProp = props["名前"];
    const name =
      titleProp?.title?.[0]?.plain_text ??
      titleProp?.title?.[0]?.text?.content ??
      "No name";

    const slugProp = props["slug"];
    const slug =
      slugProp?.rich_text?.[0]?.plain_text ??
      slugProp?.rich_text?.[0]?.text?.content ??
      page.id;

    const makerProp = props["maker"];
    const maker = makerProp?.select?.name ?? null;

    const yearProp = props["release_year"];
    const releaseYear = yearProp?.number ?? null;

    const difficultyProp = props["difficulty"];
    const difficulty =
      (difficultyProp?.select?.name as "basic" | "advanced" | null) ?? null;

    return {
      id: page.id,
      name,
      slug,
      maker,
      releaseYear,
      difficulty,
    };
  });
}


export type CarDetail = Car & {
  summary: string | null;
  specHighlights: string | null;
  pros: string | null;
  cons: string | null;
  changeSummary: string | null;
  referenceUrl: string | null;
};

function extractText(prop: any): string | null {
  if (!prop) return null;
  const rich = prop.rich_text ?? prop.title;
  if (!Array.isArray(rich) || rich.length === 0) return null;
  const first = rich[0] as any;
  return first.plain_text ?? first.text?.content ?? null;
}

export async function getCarBySlug(slug: string): Promise<CarDetail | null> {
  const databaseId = await getDatabaseIdByTitle("cars");

  const response = await notion.databases.query({
    database_id: databaseId,
    page_size: 1,
    filter: {
      property: "slug",
      rich_text: {
        equals: slug,
      },
    },
  });

  if (response.results.length === 0) {
    return null;
  }

  const page: any = response.results[0];
  const props = page.properties;

  const titleProp = props["名前"];
  const name =
    titleProp?.title?.[0]?.plain_text ??
    titleProp?.title?.[0]?.text?.content ??
    "No name";

  const maker = props["maker"]?.select?.name ?? null;
  const releaseYear = props["release_year"]?.number ?? null;
  const difficulty =
    (props["difficulty"]?.select?.name as "basic" | "advanced" | null) ?? null;

  const summary = extractText(props["summary"]);
  const specHighlights = extractText(props["spec_highlights"]);
  const pros = extractText(props["pros"]);
  const cons = extractText(props["cons"]);
  const changeSummary = extractText(props["change_summary"]);
  const referenceUrl = props["reference_url"]?.url ?? null;

  const slugProp = props["slug"];
  const slugValue =
    slugProp?.rich_text?.[0]?.plain_text ??
    slugProp?.rich_text?.[0]?.text?.content ??
    page.id;

  return {
    id: page.id,
    name,
    slug: slugValue,
    maker,
    releaseYear,
    difficulty,
    summary,
    specHighlights,
    pros,
    cons,
    changeSummary,
    referenceUrl,
  };
}
