import { NextResponse } from "next/server";

import supabase from "../../../lib/supabase.js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    let query = supabase
      .from("articles")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(100);

    if (category && category !== "Todas") {
      query = query.eq("category", category);
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
