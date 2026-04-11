import { NextResponse } from "next/server";

import supabase from "../../../lib/supabase.js";

export async function GET() {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTodayIso = startOfToday.toISOString();

    const { data: existingSummaries, error: existingError } = await supabase
      .from("summaries")
      .select("*")
      .gte("created_at", startOfTodayIso)
      .order("created_at", { ascending: false })
      .limit(1);

    if (existingError) {
      throw existingError;
    }

    if (existingSummaries?.length) {
      return NextResponse.json({ summary: existingSummaries[0] });
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

    const { error: insertError } = await supabase
      .from("summaries")
      .insert({ content: text });

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({
      summary: { content: text, created_at: new Date().toISOString() },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
