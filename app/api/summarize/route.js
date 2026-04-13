import { NextResponse } from "next/server";

import supabase from "../../../lib/supabase.js";

const SUMMARY_STOPWORDS = new Set([
  "para",
  "como",
  "mais",
  "pelo",
  "pela",
  "este",
  "esta",
  "esse",
  "essa",
  "entre",
  "quando",
  "sobre",
  "após",
  "numa",
  "with",
  "that",
  "from",
  "have",
  "this",
  "they",
  "were",
  "been",
  "will",
  "their",
  "than",
  "também",
  "seria",
  "sendo",
  "pela",
  "pelos",
  "pelas",
  "foram",
  "está",
  "numa",
  "seus",
  "suas",
  "isso",
  "onde",
  "quem",
]);

function extractTopWords(text, limit = 3) {
  const words = (text || "")
    .toLowerCase()
    .replace(/[^a-zà-ÿ0-9\s]/gi, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => word.length >= 4 && !SUMMARY_STOPWORDS.has(word));

  const counts = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([word]) => word);
}

async function matchSummaryPoints(text, sinceIso) {
  const points = (text || "")
    .split(/\d+\.\s/)
    .map((point) => point.trim())
    .filter(Boolean);

  const matchedPoints = [];

  for (const pointText of points) {
    const words = extractTopWords(pointText);
    let url = null;

    if (words.length > 0) {
      const filters = words.map((w) => `title.ilike.%${w}%`).join(",");
      const { data: matchedArticles, error: matchError } = await supabase
        .from("articles")
        .select("url")
        .gte("published_at", sinceIso)
        .or(filters)
        .limit(1);

      if (matchError) {
        console.error("Summary point match error:", matchError.message);
      } else if (matchedArticles?.length) {
        url = matchedArticles[0]?.url || null;
      }
    }

    matchedPoints.push({ text: pointText, url });
  }

  return matchedPoints;
}

export async function GET(request) {
  try {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();

    const { data: existingSummaries, error: existingError } = await supabase
      .from("summaries")
      .select("*")
      .gte("created_at", threeHoursAgo)
      .order("created_at", { ascending: false })
      .limit(1);

    if (existingError) {
      throw existingError;
    }

    if (existingSummaries?.length) {
      const existingSummary = existingSummaries[0];
      let points = [];

      if (existingSummary?.points) {
        if (typeof existingSummary.points === "string") {
          try {
            points = JSON.parse(existingSummary.points);
          } catch {
            points = [];
          }
        } else if (Array.isArray(existingSummary.points)) {
          points = existingSummary.points;
        }
      }

      return NextResponse.json({ summary: { ...existingSummary, points } });
    }

    const sinceIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: articles, error: articlesError } = await supabase
      .from("articles")
      .select("title, source")
      .gte("published_at", sinceIso)
      .order("published_at", { ascending: false })
      .limit(80);

    if (articlesError) {
      throw articlesError;
    }

    const prompt =
      "És um jornalista português sénior. Com base nas seguintes notícias " +
      "das últimas 24 horas, escreve um resumo do dia com exactamente 5 pontos " +
      "principais. Cada ponto deve ter no máximo 2 frases. Sé directo, " +
      "factual e usa um tom jornalístico sóbrio. Não uses emojis. " +
      "Responde apenas com os 5 pontos numerados, sem introdução nem conclusão.\n\n" +
      "Notícias:\n" +
      (articles ?? []).map((a) => `- ${a.title} (${a.source})`).join("\n");

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error("Missing GEMINI_API_KEY");
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      },
    );

    const result = await geminiRes.json();
    if (!geminiRes.ok) {
      throw new Error(result?.error?.message ?? "Gemini request failed");
    }

    const text = result.candidates[0].content.parts[0].text;
    const points = await matchSummaryPoints(text, sinceIso);
    const createdAt = new Date().toISOString();

    const { error: insertError } = await supabase
      .from("summaries")
      .insert({ content: text, points: JSON.stringify(points) });

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({
      summary: { content: text, points, created_at: createdAt },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
