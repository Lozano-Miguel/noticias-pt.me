import { NextResponse } from "next/server";

import sql from "../../../lib/db";
import SOURCES from "../../../lib/sources.js";
import fetchAndSave from "../../../lib/fetchFeed.js";
import fetchAndSaveEco from "../../../lib/fetchEco.js";

export const maxDuration = 300;

export async function GET() {
  const succeeded = [];
  const failed = [];

  try {
    const cleanupDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    await sql`
      delete from articles
      where published_at < ${cleanupDate}
    `;

    console.log('Cleanup done, cutoff:', cleanupDate)
  } catch (error) {
    console.log("FAILED: delete old articles - " + error.message);
  }

  const timingSlots = [];
  const results = await Promise.allSettled(
    SOURCES.map(async (source, index) => {
      console.log("Fetching: " + source.name + " - " + source.url);
      const start = Date.now();
      try {
        await fetchAndSave(source);
      } finally {
        timingSlots[index] = {
          source: source.name,
          url: source.url,
          seconds: (Date.now() - start) / 1000,
        };
      }
    }),
  );

  const timing = [...timingSlots].sort((a, b) => b.seconds - a.seconds);

  results.forEach((result, index) => {
    const source = SOURCES[index];
    if (result.status === "fulfilled") {
      console.log("OK: " + source.name);
      succeeded.push(source.name);
    } else {
      const reason =
        result.reason instanceof Error
          ? result.reason.message
          : String(result.reason);
      console.log("FAILED: " + source.name + " - " + reason);
      failed.push(source.name + " - " + reason);
    }
  });

  await fetchAndSaveEco();
  succeeded.push("ECO Sapo");

  try {
    await sql`select cleanup_old_articles()`;
  } catch (error) {
    console.log("FAILED: cleanup_old_articles - " + error.message);
  }

  return NextResponse.json({ succeeded, failed, timing });
}
