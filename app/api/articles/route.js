import { NextResponse } from "next/server";

import supabase from "../../../lib/supabase.js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const source = searchParams.get("source");

    let query = supabase
      .from("articles")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(100);

    if (category && category !== "Todas") {
      query = query.eq("category", category);
    }

    if (source && source !== "Todas") {
      query = query.eq("source", source);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
