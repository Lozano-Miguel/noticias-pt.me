"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ArticleCard from "./ArticleCard.js";
import ArticleSkeleton from "./ArticleSkeleton.js";
import Trending from "./Trending.js";

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

const SOURCES = [
  "Todas",
  "ECO Sapo",
  "Notícias ao Minuto",
  "RTP Notícias",
  "Renascença",
  "SAPO",
  "Correio da Manhã",
  "Record",
  "Jornal de Negócios",
  "Observador",
  "Público",
];

export default function ArticleFeed({ articles }) {
  const [articlesState, setArticlesState] = useState(articles);
  const [activeCategories, setActiveCategories] = useState([]);
  const [activeSource, setActiveSource] = useState("Todas");
  const [showSources, setShowSources] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const loaderRef = useRef(null);

  const ARTICLES_PER_PAGE = 20;

  async function fetchArticles() {
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (activeCategories.length === 1) {
        params.set("category", activeCategories[0]);
      } else if (activeCategories.length > 1) {
        params.set("categories", activeCategories.join(","));
      }
      if (activeSource !== "Todas") {
        params.set("source", activeSource);
      }
      if (searchQuery !== "") {
        params.set("search", searchQuery);
      }
      const qs = params.toString();
      const url = qs ? `/api/articles?${qs}` : "/api/articles";

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
  }, [activeCategories, activeSource, searchQuery]);

  const filteredArticles = useMemo(
    () => (Array.isArray(articlesState) ? articlesState : []),
    [articlesState],
  );

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          if (filteredArticles.length > page * ARTICLES_PER_PAGE) {
            setPage((prev) => prev + 1);
          }
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [filteredArticles.length, page]);

  const paginatedArticles = useMemo(() => {
    const all = Array.isArray(articlesState) ? articlesState : [];
    return all.slice(0, page * ARTICLES_PER_PAGE);
  }, [ARTICLES_PER_PAGE, articlesState, page]);

  const totalCount = Array.isArray(articlesState) ? articlesState.length : 0;

  function handleTrendingSearch(word) {
    setSearchInput(word);
    setSearchQuery(word);
    setPage(1);
  }

  return (
    <>
      <div className="px-4 pb-1 pt-3">
        <div className="flex">
          <div className="relative min-w-0 flex-1">
            <input
              type="text"
              placeholder="Pesquisar notícias..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSearchQuery(searchInput);
                  setPage(1);
                }
              }}
              className="w-full rounded-lg border border-transparent bg-zinc-100 px-4 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-600"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery(searchInput);
              setPage(1);
            }}
            className="ml-2 shrink-0 rounded-lg bg-zinc-900 px-3 py-2 text-sm text-white dark:bg-white dark:text-zinc-900"
          >
            Pesquisar
          </button>
        </div>
        {searchQuery !== "" ? (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSearchInput("");
              setPage(1);
            }}
            className="mt-1 text-xs text-zinc-400 underline"
          >
            Limpar pesquisa
          </button>
        ) : null}
      </div>

      <Trending onSearch={handleTrendingSearch} />

      {searchQuery === "" ? (
        <>
          <div className="flex items-center gap-2 px-4 py-3">
            <div className="scrollbar-hide flex min-w-0 flex-1 gap-2 overflow-x-auto">
              {CATEGORIES.map((category) => {
                const isActive =
                  category === "Todas"
                    ? activeCategories.length === 0
                    : activeCategories.includes(category);

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      if (category === "Todas") {
                        setActiveCategories([]);
                        return;
                      }

                      setActiveCategories((prev) => {
                        if (prev.includes(category)) {
                          return prev.filter((item) => item !== category);
                        }

                        return [...prev, category];
                      });
                    }}
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
            <button
              type="button"
              onClick={() => setShowSources((v) => !v)}
              className="flex-shrink-0 rounded-full border border-zinc-300 px-3 py-1 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
            >
              {showSources ? "Fechar" : "Fonte"}
            </button>
          </div>

          {showSources ? (
            <div className="flex gap-2 overflow-x-auto border-b border-zinc-100 px-4 py-2 scrollbar-hide dark:border-zinc-800">
              {SOURCES.map((sourceName) => {
                const isActive = sourceName === activeSource;

                return (
                  <button
                    key={sourceName}
                    type="button"
                    onClick={() => setActiveSource(sourceName)}
                    className={[
                      "shrink-0 rounded-full px-3 py-1 text-sm",
                      isActive
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
                    ].join(" ")}
                  >
                    {sourceName}
                  </button>
                );
              })}
            </div>
          ) : null}
        </>
      ) : null}

      <main className="mx-auto max-w-2xl px-4 py-4">
        {loading && page === 1 ? (
          <>
            <ArticleSkeleton type="featured" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <ArticleSkeleton type="grid" />
              <ArticleSkeleton type="grid" />
              <ArticleSkeleton type="grid" />
              <ArticleSkeleton type="grid" />
            </div>
            <div className="mt-6">
              <ArticleSkeleton type="compact" />
              <ArticleSkeleton type="compact" />
              <ArticleSkeleton type="compact" />
              <ArticleSkeleton type="compact" />
              <ArticleSkeleton type="compact" />
              <ArticleSkeleton type="compact" />
            </div>
          </>
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
                    {article.description ? (
                      <p className="hidden md:block text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 line-clamp-2">
                        {article.description}
                      </p>
                    ) : null}
                    {article.published_at ? (
                      <div className="hidden md:block text-xs text-zinc-400 mt-1">
                        {new Date(article.published_at).toLocaleString("pt-PT", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}

            {loading && page > 1 ? (
              <div className="mt-6 flex flex-col items-center gap-2">
                <ArticleSkeleton type="compact" />
                <ArticleSkeleton type="compact" />
                <ArticleSkeleton type="compact" />
              </div>
            ) : null}

            <div ref={loaderRef} className="h-10" />
          </>
        )}
      </main>
    </>
  );
}
