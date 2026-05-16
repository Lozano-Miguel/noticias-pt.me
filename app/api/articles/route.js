import { NextResponse } from "next/server";

import sql from "../../../lib/db";
import deduplicateArticles from "../../../lib/deduplicate.js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cap = (value, max) =>
      typeof value === "string" ? value.slice(0, max) : value;
    const category = cap(searchParams.get("category"), 50);
    const categories = cap(searchParams.get("categories"), 50);
    const source = cap(searchParams.get("source"), 50);
    const sources = cap(searchParams.get("sources"), 50);
    const search = cap(searchParams.get("search"), 100);

    let categoriesArray = [];
    let sourcesArray = [];

    if (categories) {
      categoriesArray = categories
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    } else if (category && category !== "Todas") {
      categoriesArray = [category];
    }

    if (sources) {
      const parsedSourcesArray = sources
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      sourcesArray = parsedSourcesArray;
    } else if (source && source !== "Todas") {
      sourcesArray = [source];
    }

    const searchTerm = search?.trim() || "";
    const searchPattern = searchTerm ? `%${searchTerm}%` : null;

    const data = await sql`
      select id, title, description, url, image_url, published_at, source, category, is_paywall
      from articles
      where
        (${categoriesArray.length === 0} or category = any(${categoriesArray}))
        and (${sourcesArray.length === 0} or source = any(${sourcesArray}))
        and (
          ${searchPattern}::text is null
          or title ilike ${searchPattern}
          or coalesce(description, '') ilike ${searchPattern}
        )
      order by published_at desc
      limit 60
    `;

    const deduplicated = deduplicateArticles(data ?? []);

    return NextResponse.json(deduplicated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
