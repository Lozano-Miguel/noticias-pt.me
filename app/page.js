import sql from "../lib/db";
import ArticleFeed from "../components/ArticleFeed.js";
import ChatBot from "../components/ChatBot.js";
import ResumoDoDia from "../components/ResumoDoDia.js";
import NewsletterSignup from "../components/NewsletterSignup.js";
import SiteHeader from "../components/SiteHeader.js";

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
      <SiteHeader />

      <ResumoDoDia />

      <ArticleFeed articles={articles} />

      <footer className="mt-10 text-center text-xs text-zinc-400">
        Notícias PT — Agregador de notícias portuguesas
      </footer>

      <ChatBot />
      <NewsletterSignup />
    </div>
  );
}
