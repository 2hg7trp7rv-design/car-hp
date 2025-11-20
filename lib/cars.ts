// lib/cars.ts
import { notion, getDatabaseIdByTitle } from "./notion";

export type Car = {
  id: string;
  name: string;
  slug: string;
  maker: string | null;
  releaseYear: number | null;
  difficulty: "basic" | "advanced" | null;
  summary: string | null;
  specHighlights: string | null;
  pros: string | null;
  cons: string | null;
  changeSummary: string | null;
  referenceUrl: string | null;
};

function mapCar(page: any): Car {
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

  const summaryProp = props["summary"];
  const summary = summaryProp?.rich_text?.[0]?.plain_text ?? null;

  const specHighlightsProp = props["spec_highlights"];
  const specHighlights = specHighlightsProp?.rich_text?.[0]?.plain_text ?? null;

  const prosProp = props["pros"];
  const pros = prosProp?.rich_text?.[0]?.plain_text ?? null;

  const consProp = props["cons"];
  const cons = consProp?.rich_text?.[0]?.plain_text ?? null;

  const changeSummaryProp = props["change_summary"];
  const changeSummary =
    changeSummaryProp?.rich_text?.[0]?.plain_text ?? null;

  const refUrlProp = props["reference_url"];
  const referenceUrl = refUrlProp?.url ?? null;

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
  const databaseId = await getDatabaseIdByTitle("cars");

  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [
      {
        property: "release_year",
        direction: "descending",
      },
    ],
  });

  return response.results.map((page: any) => mapCar(page));
}

export async function getCarBySlug(slug: string): Promise<Car | null> {
  const databaseId = await getDatabaseIdByTitle("cars");

  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: "slug",
      rich_text: {
        equals: slug,
      },
    },
  });

  const page = response.results[0];
  if (!page) return null;

  return mapCar(page);
}
