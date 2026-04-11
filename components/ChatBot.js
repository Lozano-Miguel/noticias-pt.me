"use client";

import { useEffect, useState } from "react";

const PRESETS = [
  "Resume-me o dia em 30 segundos",
  "O que se passa no desporto hoje?",
  "O que devo saber antes de abrir o Twitter?",
];

const PRESET_PROMPTS = {
  "Resume-me o dia em 30 segundos":
    "Resume as notícias mais importantes de hoje em exactamente 5 frases curtas.",
  "O que se passa no desporto hoje?":
    "Quais são as principais notícias de desporto de hoje?",
  "O que devo saber antes de abrir o Twitter?":
    "Quais são os temas e assuntos mais falados nas notícias portuguesas hoje? Lista os 5 principais tópicos que estão em destaque.",
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [questionsLeft, setQuestionsLeft] = useState(3);
  const [usedPresets, setUsedPresets] = useState([]);

  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem("chat_date");

    if (storedDate && storedDate === today) {
      const stored = localStorage.getItem("questions_left");
      if (stored !== null) {
        const parsed = parseInt(stored, 10);
        if (!Number.isNaN(parsed)) {
          setQuestionsLeft(parsed);
        }
      }
    } else {
      localStorage.setItem("chat_date", today);
      localStorage.setItem("questions_left", "3");
      setQuestionsLeft(3);
    }
  }, []);

  const unusedPresets = PRESETS.filter((p) => !usedPresets.includes(p));

  async function sendMessage(text) {
    if (questionsLeft === 0 || loading) return;

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const newCount = questionsLeft - 1;
    setQuestionsLeft(newCount);
    localStorage.setItem("questions_left", newCount.toString());

    const messagesForApi = newMessages.map((m) =>
      m.role === "user" && Object.hasOwn(PRESET_PROMPTS, m.content)
        ? { role: "user", content: PRESET_PROMPTS[m.content] }
        : m,
    );

    try {
      const articlesRes = await fetch("/api/articles");
      const articles = await articlesRes.json();
      const context = articles
        .slice(0, 50)
        .map((a) => `- ${a.title} (${a.source})`)
        .join("\n");

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messagesForApi,
          context,
        }),
      });

      const data = await res.json();
      const reply = data.reply ?? "Ocorreu um erro. Tenta novamente.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Ocorreu um erro. Tenta novamente." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg transition-transform hover:scale-105 dark:bg-white dark:text-zinc-900"
      >
        {isOpen ? (
          <span className="text-lg leading-none">✕</span>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {isOpen ? (
        <div
          className="fixed bottom-24 left-4 right-4 z-50 flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 md:left-auto md:w-96"
          style={{ maxHeight: "70vh" }}
        >
          <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <div className="text-sm font-medium">Fala com as Notícias</div>
            <div className="text-xs text-zinc-400">
              {questionsLeft > 0
                ? `${questionsLeft} pergunta${questionsLeft !== 1 ? "s" : ""} restante${questionsLeft !== 1 ? "s" : ""}`
                : "Volta amanhã para mais perguntas"}
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={msg.role === "user" ? "text-right" : "text-left"}
              >
                <span
                  className={
                    msg.role === "user"
                      ? "ml-auto inline-block max-w-xs rounded-2xl rounded-tr-sm bg-zinc-900 px-3 py-2 text-sm text-white dark:bg-white dark:text-zinc-900"
                      : "inline-block max-w-xs rounded-2xl rounded-tl-sm bg-zinc-100 px-3 py-2 text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                  }
                >
                  {msg.role === "user" ? (
                    msg.content
                  ) : (
                    <div className="space-y-1">
                      {msg.content
                        .split("\n")
                        .filter((line) => line.trim())
                        .map((line, j) => (
                          <p
                            key={j}
                            className="text-sm leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: line.replace(
                                /\*\*(.*?)\*\*/g,
                                "<strong>$1</strong>",
                              ),
                            }}
                          />
                        ))}
                    </div>
                  )}
                </span>
              </div>
            ))}

            {unusedPresets.length > 0 && questionsLeft > 0
              ? unusedPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setUsedPresets((prev) => [...prev, preset]);
                      sendMessage(preset);
                    }}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    {preset}
                  </button>
                ))
              : null}

            {loading ? (
              <div className="text-left">
                <span className="inline-block max-w-xs rounded-2xl rounded-tl-sm bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400 dark:bg-zinc-500" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400 dark:bg-zinc-500" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400 dark:bg-zinc-500" />
                  </span>
                </span>
              </div>
            ) : null}
          </div>

          <div className="border-t border-zinc-100 p-3 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && input.trim()) {
                    sendMessage(input.trim());
                  }
                }}
                disabled={questionsLeft === 0 || loading}
                placeholder={
                  questionsLeft > 0
                    ? "Escreve uma pergunta..."
                    : "Volta amanhã..."
                }
                className="flex-1 rounded-full bg-zinc-100 px-4 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-100"
              />
              <button
                type="button"
                onClick={() => {
                  if (input.trim()) sendMessage(input.trim());
                }}
                disabled={
                  questionsLeft === 0 || loading || !input.trim()
                }
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white transition-opacity disabled:opacity-30 dark:bg-white dark:text-zinc-900"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
