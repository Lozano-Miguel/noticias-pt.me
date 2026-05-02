import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { messages, context } = await request.json();

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) throw new Error("Missing GROQ_API_KEY");

    const systemPrompt =
      "És um assistente de notícias português. Respondes sempre em português europeu. " +
      "És directo, informado e usas um tom jornalístico sóbrio. Não uses emojis. " +
      "Baseia as tuas respostas APENAS nas seguintes notícias de hoje:\n\n" +
      context;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        max_tokens: 1024,
        temperature: 0.5,
      }),
    });

    const result = await groqRes.json();
    if (!groqRes.ok)
      throw new Error(result?.error?.message ?? "Groq request failed");

    const text = result.choices[0].message.content;

    return NextResponse.json({ reply: text });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
