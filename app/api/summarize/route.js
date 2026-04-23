import { NextResponse } from "next/server";

import sql from "../../../lib/db";

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
      try {
        const likeClauses = words.map((word) => {
          const pattern = `%${word}%`;
          return sql`title ilike ${pattern}`;
        });
        const matchedArticles = await sql`
          select url
          from articles
          where published_at >= ${sinceIso}
            and (${sql.join(likeClauses, sql` or `)})
          limit 1
        `;

        if (matchedArticles?.length) {
          url = matchedArticles[0]?.url || null;
        }
      } catch (matchError) {
        console.error("Summary point match error:", matchError.message);
      }
    }

    matchedPoints.push({ text: pointText, url });
  }

  return matchedPoints;
}

export async function GET(request) {
  try {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();

    const existingSummaries = await sql`
      select *
      from summaries
      where created_at >= ${threeHoursAgo}
      order by created_at desc
      limit 1
    `;

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

    const articles = await sql`
      select title, source
      from articles
      where published_at >= ${sinceIso}
      order by published_at desc
      limit 80
    `;

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

    await sql`
      insert into summaries (content, points)
      values (${text}, ${JSON.stringify(points)})
    `;

    return NextResponse.json({
      summary: { content: text, points, created_at: createdAt },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
