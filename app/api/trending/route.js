import { NextResponse } from "next/server";

import sql from "../../../lib/db";

const STOPWORDS = new Set([
  "de",
  "a",
  "o",
  "e",
  "do",
  "da",
  "em",
  "que",
  "no",
  "na",
  "os",
  "as",
  "um",
  "uma",
  "para",
  "com",
  "por",
  "se",
  "ao",
  "dos",
  "das",
  "mais",
  "mas",
  "foi",
  "não",
  "são",
  "ele",
  "ela",
  "já",
  "pelo",
  "pela",
  "its",
  "the",
  "and",
  "of",
  "to",
  "in",
  "is",
  "after",
  "at",
  "on",
  "an",
  "this",
  "from",
  "has",
  "have",
  "will",
  "about",
  "over",
  "also",
  "new",
  "up",
  "out",
  "who",
  "into",
  "than",
  "be",
  "or",
  "their",
  "há",
  "ser",
  "ter",
  "isso",
  "este",
  "esta",
  "entre",
  "quando",
  "como",
  "seus",
  "sua",
  "num",
  "numa",
  "onde",
  "até",
  "sobre",
  "contra",
  "após",
  "sem",
]);

export async function GET() {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const data = await sql`
      select title
      from articles
      where published_at >= ${since}
      limit 200
    `;

    const bigString = (data ?? [])
      .map((row) => row.title ?? "")
      .join(" ");

    const words = bigString.split(/\s+/);

    const frequency = new Map();

    for (const raw of words) {
      if (!raw) continue;

      let word = raw.toLowerCase();
      word = word.replace(/[^\p{L}\p{N}]+/gu, "");

      if (word.length < 4) continue;
      if (STOPWORDS.has(word)) continue;
      if (/^\d+$/.test(word)) continue;

      frequency.set(word, (frequency.get(word) ?? 0) + 1);
    }

    const sorted = [...frequency.entries()].sort((a, b) => b[1] - a[1]);
    const trending = sorted.slice(0, 10).map(([w]) => w);

    return NextResponse.json({ trending });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
