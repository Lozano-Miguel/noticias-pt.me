import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { messages, context } = await request.json();

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) throw new Error("Missing GEMINI_API_KEY");

    const systemPrompt =
      "És um assistente de notícias português. Respondes sempre em português europeu. " +
      "És directo, informado e usas um tom jornalístico sóbrio. Não uses emojis. " +
      "Baseia as tuas respostas APENAS nas seguintes notícias de hoje:\n\n" +
      context;

    const contents = [
      { role: "user", parts: [{ text: systemPrompt }] },
      {
        role: "model",
        parts: [
          {
            text: "Entendido. Estou pronto para responder com base nas notícias de hoje.",
          },
        ],
      },
      ...messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    ];

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      },
    );

    const result = await geminiRes.json();
    if (!geminiRes.ok)
      throw new Error(result?.error?.message ?? "Gemini request failed");

    const text = result.candidates[0].content.parts[0].text;

    return NextResponse.json({ reply: text });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
