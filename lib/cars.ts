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

  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [
      {
        property: "release_year",
        direction: "descending",
      },
    ],
  });

  return response.results.map((page: any) => {
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

  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [
      {
        property: "release_year",
        direction: "descending",
      },
    ],
  });

  return response.results.map((page: any) => {
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
