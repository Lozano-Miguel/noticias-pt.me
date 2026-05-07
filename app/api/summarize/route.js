import { NextResponse } from "next/server";

import sql from "../../../lib/db";

const extractWords = (text) => {
  if (!text || typeof text !== 'string') return []
  
  const stopwords = ['para','como','mais','pelo','pela','este','esta',
    'esse','essa','entre','quando','sobre','após','numa','that','from',
    'have','this','they','were','been','will','their','than','também',
    'seria','sendo','pelos','pelas','foram','está','seus','suas','isso',
    'onde','quem','com','que','por','uma','uns','umas','dos','das',
    'nos','nas','pelo','pela','num','duma','dum','nuns','numas']
  
  return text
    .toLowerCase()
    .replace(/[^a-záàâãéèêíïóôõöúüçñ\s]/gi, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopwords.includes(w))
}

async function matchSummaryPoints(text, sinceIso) {
  const points = (text || "")
    .split(/\d+\.\s/)
    .map((point) => point.trim())
    .filter(Boolean);

  const matchedPoints = [];

  for (const pointText of points) {
    let url = null;

    const words = extractWords(pointText)

    if (!Array.isArray(words) || words.length === 0) {
      matchedPoints.push({ text: pointText, url: null });
      continue;
    }

    const orFilter = words
      .slice(0, 3)
      .map(w => `title.ilike.%${w}%`)
      .join(',')

    try {
      const likeClauses = words.slice(0, 3).map((word) => {
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
