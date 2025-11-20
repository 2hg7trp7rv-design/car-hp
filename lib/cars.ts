// lib/cars.ts
import { notion, getDatabaseIdByTitle } from "./notion";

export type Car = {
  id: string;
  name: string;
  slug: string;
  maker: string | null;
  releaseYear: number | null;
  difficulty: string | null;
  summary: string | null;
  specHighlights: string | null;
  pros: string | null;
  cons: string | null;
  changeSummary: string | null;
  referenceUrl: string | null;
};

const CAR_DB_TITLE = "cars";

async function getCarsDatabaseId(): Promise<string> {
  return getDatabaseIdByTitle(CAR_DB_TITLE);
}

function mapPageToCar(page: any): Car {
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
  const maker =
    makerProp?.select?.name ??
    makerProp?.rich_text?.[0]?.plain_text ??
    null;

  const yearProp = props["release_year"];
  const releaseYear = yearProp?.number ?? null;

  const difficultyProp = props["difficulty"];
  const difficulty = difficultyProp?.select?.name ?? null;

  const summaryProp = props["summary"];
  const summary =
    summaryProp?.rich_text?.map((t: any) => t.plain_text).join("") ?? null;

  const specHighlightsProp = props["spec_highlights"];
  const specHighlights =
    specHighlightsProp?.rich_text?.map((t: any) => t.plain_text).join("") ??
    null;

  const prosProp = props["pros"];
  const pros =
    prosProp?.rich_text?.map((t: any) => t.plain_text).join("") ?? null;

  const consProp = props["cons"];
  const cons =
    consProp?.rich_text?.map((t: any) => t.plain_text).join("") ?? null;

  const changeSummaryProp = props["change_summary"];
  const changeSummary =
    changeSummaryProp?.rich_text?.map((t: any) => t.plain_text).join("") ??
    null;

  const referenceUrlProp = props["reference_url"];
  const referenceUrl = referenceUrlProp?.url ?? null;

  return {
    id: page.id,
    name,
    slug,
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

export async function getAllCars(): Promise<Car[]> {
  const databaseId = await getCarsDatabaseId();

  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [
      {
        property: "release_year",
        direction: "descending",
      },
    ],
  });

  return response.results.map(mapPageToCar);
}

export async function getCarBySlug(slug: string): Promise<Car | null> {
  const databaseId = await getCarsDatabaseId();

  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: "slug",
      rich_text: {
        equals: slug,
      },
    },
    page_size: 1,
  });

  if (response.results.length === 0) {
    return null;
  }
  return mapPageToCar(response.results[0]);
}
