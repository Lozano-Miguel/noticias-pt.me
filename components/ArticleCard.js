export default function ArticleCard({ article }) {
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    
    // Check if time info exists by seeing if the ISO string has a non-zero time
    // RSS feeds without time default to T00:00:00Z
    const hasRealTime = !dateString.endsWith('T00:00:00.000Z') && 
                        !dateString.endsWith('T00:00:00Z') &&
                        !(date.getUTCHours() === 0 && date.getUTCMinutes() === 0)
    
    if (hasRealTime) {
      return date.toLocaleString('pt-PT', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    return date.toLocaleDateString('pt-PT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const publishedLabel = formatDate(article?.published_at);

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          url: article.url,
        });
      } catch (err) {
        // user cancelled, do nothing
      }
    } else {
      await navigator.clipboard.writeText(article.url);
      alert("Link copiado!");
    }
  }

  return (
    <article className="bg-white dark:bg-zinc-900 rounded-lg overflow-hidden border border-zinc-100 dark:border-zinc-800">
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
            <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-zinc-700 px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-zinc-300 ring-1 ring-inset ring-blue-200">
              {article.category}
            </span>
          ) : null}
          {article?.source ? (
            <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-zinc-700 px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-zinc-400 ring-1 ring-inset ring-gray-200">
              {article.source}
            </span>
          ) : null}
          {article?.is_paywall ? (
            <span className="text-xs px-2 py-0.5 rounded-full text-zinc-400 dark:text-zinc-500 border border-zinc-200 dark:border-zinc-700">
              Acesso pago
            </span>
          ) : null}
        </div>

        {article?.also_in?.length > 0 ? (
          <div className="text-xs text-zinc-400 dark:text-zinc-500">
            Também em: {article.also_in.join(", ")}
          </div>
        ) : null}

        <a
          href={article?.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block break-words text-base font-semibold leading-snug text-gray-900 dark:text-zinc-100 hover:underline sm:text-lg"
        >
          {article?.title}
        </a>

        {article?.description ? (
          <p className="line-clamp-3 break-words text-sm leading-relaxed text-gray-600 dark:text-zinc-400">
            {article.description}
          </p>
        ) : null}

        {publishedLabel ? (
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-zinc-400 dark:text-zinc-500">{publishedLabel}</span>
            <button
              type="button"
              onClick={handleShare}
              className="ml-auto text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}
