"use client";

import { useEffect, useMemo, useState } from "react";
import ArticleCard from "./ArticleCard.js";

const CATEGORIES = [
  "Todas",
  "Última Hora",
  "País",
  "Mundo",
  "Política",
  "Economia",
  "Desporto",
  "Tecnologia",
  "Cultura",
  "Lifestyle",
  "Opinião",
  "Automóvel",
];

export default function ArticleFeed({ articles }) {
  const [articlesState, setArticlesState] = useState(articles);
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const ARTICLES_PER_PAGE = 20;

  async function fetchArticles() {
    setLoading(true);

    try {
      const url =
        activeCategory === "Todas"
          ? "/api/articles"
          : `/api/articles?category=${encodeURIComponent(activeCategory)}`;

      const res = await fetch(url);
      const data = await res.json();
      setArticlesState(data);
    } catch {
      setArticlesState([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPage(1);
    fetchArticles();
  }, [activeCategory]);

  const paginatedArticles = useMemo(() => {
    const all = Array.isArray(articlesState) ? articlesState : [];
    return all.slice(0, page * ARTICLES_PER_PAGE);
  }, [ARTICLES_PER_PAGE, articlesState, page]);

  const totalCount = Array.isArray(articlesState) ? articlesState.length : 0;

  return (
    <>
      <div className="scrollbar-hide flex gap-2 overflow-x-auto px-4 py-3">
        {CATEGORIES.map((category) => {
          const isActive = category === activeCategory;

          return (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={[
                "shrink-0 rounded-full px-3 py-1 text-sm",
                isActive
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
              ].join(" ")}
            >
              {category}
            </button>
          );
        })}
      </div>

      <main className="mx-auto max-w-2xl px-4 py-4">
        {loading ? (
          <div className="py-10 text-center text-sm text-zinc-400">
            A carregar...
          </div>
        ) : paginatedArticles.length === 0 ? (
          <p className="py-10 text-center text-sm text-zinc-400">
            Sem artigos nesta categoria.
          </p>
        ) : (
          <>
            {paginatedArticles[0] ? (
              <ArticleCard article={paginatedArticles[0]} />
            ) : null}

            {paginatedArticles.length > 1 ? (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {paginatedArticles.slice(1, 7).map((article) => (
                  <ArticleCard key={article.url} article={article} />
                ))}
              </div>
            ) : null}

            {paginatedArticles.length > 7 ? (
              <div className="mt-6 divide-y divide-zinc-200 dark:divide-zinc-800">
                {paginatedArticles.slice(7).map((article) => (
                  <div key={article.url} className="py-3">
                    <div className="text-xs text-zinc-400">
                      {article.source}
                    </div>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block break-words text-sm font-medium leading-snug text-zinc-900 hover:underline dark:text-zinc-100"
                    >
                      {article.title}
                    </a>
                  </div>
                ))}
              </div>
            ) : null}

            {totalCount > paginatedArticles.length ? (
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                className="mt-6 w-full rounded-lg border border-zinc-200 py-3 text-sm text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
              >
                Carregar mais
              </button>
            ) : totalCount > ARTICLES_PER_PAGE ? (
              <p className="mt-6 text-center text-sm text-zinc-400">
                Sem mais artigos nesta categoria.
              </p>
            ) : null}
          </>
        )}
      </main>
    </>
  );
}
