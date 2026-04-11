import { NextResponse } from "next/server";

import supabase from "../../../lib/supabase.js";
import SOURCES from "../../../lib/sources.js";
import fetchAndSave from "../../../lib/fetchFeed.js";

export async function GET() {
  const succeeded = [];
  const failed = [];

  try {
    await supabase
      .from("articles")
      .delete()
      .lt(
        "published_at",
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      );
  } catch (error) {
    console.log("FAILED: delete old articles - " + error.message);
  }

  for (const source of SOURCES) {
    try {
      console.log("Fetching: " + source.name + " - " + source.url);
      await fetchAndSave(source);
      console.log("OK: " + source.name);
      succeeded.push(source.name);
    } catch (error) {
      console.log("FAILED: " + source.name + " - " + error.message);
      failed.push(source.name);
    }
  }

  try {
    await supabase.rpc("cleanup_old_articles");
  } catch (error) {
    console.log("FAILED: cleanup_old_articles - " + error.message);
  }

  return NextResponse.json({ succeeded, failed });
}
