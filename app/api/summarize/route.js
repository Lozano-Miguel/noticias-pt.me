import { NextResponse } from "next/server";

import sql from "../../../lib/db";
import { isRateLimited } from "../../../lib/ratelimit";

const findMatchingArticle = async (pointText) => {
  try {
    const stopwords = ['para','como','mais','pelo','pela','este','esta',
      'esse','essa','entre','quando','sobre','após','numa','com','que',
      'por','uma','dos','das','nos','nas','num','foram','está','isso']

    const words = pointText
      .toLowerCase()
      .replace(/[^a-záàâãéèêíïóôõöúüçñ\s]/gi, '')
      .split(/\s+/)
      .filter(w => w.length > 4 && !stopwords.includes(w))
      .slice(0, 3)

    if (words.length === 0) return null

    const conditions = words.map((w, i) => `title ILIKE $${i + 1}`).join(' OR ')
    const params = words.map(w => `%${w}%`)

    const result = await sql.unsafe(
      `SELECT url FROM articles 
       WHERE (${conditions})
       AND published_at > NOW() - INTERVAL '24 hours'
       ORDER BY published_at DESC 
       LIMIT 1`,
      params
    )

    return result[0]?.url || null
  } catch (err) {
    console.error('Match error:', err.message)
    return null
  }
}

async function matchSummaryPoints(text) {
  const points = (text || "")
    .split(/\d+\.\s/)
    .map((point) => point.trim())
    .filter(Boolean);

  const matchedPoints = [];

  for (const pointText of points) {
    const url = await findMatchingArticle(pointText);
    matchedPoints.push({ text: pointText, url });
  }

  return matchedPoints;
}

export async function GET(request) {
  if (isRateLimited(request, { limit: 10, windowMs: 60 * 60 * 1000 })) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

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

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      throw new Error("Missing GROQ_API_KEY");
    }

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1024,
        temperature: 0.3,
      }),
    });

    const result = await groqRes.json();
    if (!groqRes.ok) {
      throw new Error(result?.error?.message ?? "Groq request failed");
    }

    const text = result.choices[0].message.content;
    const points = await matchSummaryPoints(text);
    const createdAt = new Date().toISOString();

    await sql`
      insert into summaries (content, points)
      values (${text}, ${points})
    `;

    return NextResponse.json({
      summary: { content: text, points, created_at: createdAt },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
