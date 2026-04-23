import { NextResponse } from "next/server";

import sql from "../../../lib/db";
import deduplicateArticles from "../../../lib/deduplicate.js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const categories = searchParams.get("categories");
    const source = searchParams.get("source");
    const sources = searchParams.get("sources");
    const search = searchParams.get("search");

    const whereClauses = [];

    if (categories) {
      const categoriesArray = categories
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      if (categoriesArray.length) {
        whereClauses.push(sql`category in ${sql(categoriesArray)}`);
      }
    } else if (category && category !== "Todas") {
      whereClauses.push(sql`category = ${category}`);
    }

    if (sources) {
      const sourcesArray = sources
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      if (sourcesArray.length) {
        whereClauses.push(sql`source in ${sql(sourcesArray)}`);
      }
    } else if (source && source !== "Todas") {
      whereClauses.push(sql`source = ${source}`);
    }

    if (search && search !== "") {
      const pattern = `%${search}%`;
      whereClauses.push(
        sql`(title ilike ${pattern} or description ilike ${pattern})`,
      );
    }

    const data = await sql`
      select id, title, description, url, image_url, published_at, source, category, is_paywall
      from articles
      ${whereClauses.length
        ? sql`where ${sql.join(whereClauses, sql` and `)}`
        : sql``}
      order by published_at desc
      limit 60
    `;

    const deduplicated = deduplicateArticles(data ?? []);

    return NextResponse.json(deduplicated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
