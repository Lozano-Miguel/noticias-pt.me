import { NextResponse } from "next/server";

import supabase from "../../../lib/supabase.js";
import deduplicateArticles from "../../../lib/deduplicate.js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const categories = searchParams.get("categories");
    const source = searchParams.get("source");
    const sources = searchParams.get("sources");
    const search = searchParams.get("search");

    let query = supabase
      .from("articles")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(100);

    if (categories) {
      const categoriesArray = categories
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      if (categoriesArray.length) {
        query = query.in("category", categoriesArray);
      }
    } else if (category && category !== "Todas") {
      query = query.eq("category", category);
    }

    if (sources) {
      const sourcesArray = sources
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      if (sourcesArray.length) {
        query = query.in("source", sourcesArray);
      }
    } else if (source && source !== "Todas") {
      query = query.eq("source", source);
    }

    if (search && search !== "") {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%`,
      );
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const deduplicated = deduplicateArticles(data ?? []);

    return NextResponse.json(deduplicated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
