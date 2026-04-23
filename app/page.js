import sql from "../lib/db";
import ArticleFeed from "../components/ArticleFeed.js";
import ChatBot from "../components/ChatBot.js";
import ResumoDoDia from "../components/ResumoDoDia.js";
import ThemeToggle from "../components/ThemeToggle.js";

export default async function Page() {
  let articles = [];
  try {
    articles = await sql`
      select *
      from articles
      order by published_at desc
      limit 60
    `;
  } catch {
    articles = [];
  }

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="font-serif text-lg font-medium text-zinc-900 dark:text-zinc-100">
            Notícias PT
          </div>
          <ThemeToggle />
        </div>
      </header>

      <ResumoDoDia />

      <ArticleFeed articles={articles} />

      <footer className="mt-10 text-center text-xs text-zinc-400">
        Notícias PT — Agregador de notícias portuguesas
      </footer>

      <ChatBot />
    </div>
  );
}
