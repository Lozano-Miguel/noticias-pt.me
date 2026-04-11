export default function ArticleCard({ article }) {
  const publishedLabel = article?.published_at
    ? new Date(article.published_at).toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <article className="w-full overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition-transform duration-200 hover:-translate-y-1 hover:shadow-md">
      {article?.image_url ? (
        <img
          src={article.image_url}
          alt={article?.title ?? ""}
          className="h-48 w-full bg-gray-100 object-cover"
          loading="lazy"
        />
      ) : null}

      <div className="space-y-3 p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          {article?.category ? (
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
              {article.category}
            </span>
          ) : null}
          {article?.source ? (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-200">
              {article.source}
            </span>
          ) : null}
        </div>

        <a
          href={article?.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block break-words text-base font-semibold leading-snug text-gray-900 hover:underline sm:text-lg"
        >
          {article?.title}
        </a>

        {article?.description ? (
          <p className="line-clamp-3 break-words text-sm leading-relaxed text-gray-600">
            {article.description}
          </p>
        ) : null}

        {publishedLabel ? (
          <div className="pt-1 text-xs text-gray-500">{publishedLabel}</div>
        ) : null}
      </div>
    </article>
  );
}
