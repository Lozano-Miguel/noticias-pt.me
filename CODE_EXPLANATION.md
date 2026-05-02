# Notícias PT — Code Explanation

## Overview
`Notícias PT` is a Portuguese news aggregator built with Next.js 16, React 19, Tailwind CSS, and PostgreSQL. It collects RSS feeds from Portuguese publishers, saves them in a database, and exposes user-facing functionality like:

- news feed with category/source filters and search
- trending keywords from recent headlines
- AI-powered daily summary
- AI chat assistant based on today's news
- dark/light theme toggle
- article deduplication

The repository is organized into:

- `app/` — Next.js app routes, page, metadata, and API routes
- `components/` — UI view components for the homepage and chat
- `lib/` — backend utilities: database, RSS fetching, deduplication, source definitions

---

## Root files

### `README.md`
- Project description, features, tech stack, setup instructions, and environment variables.
- Useful for deployment and onboarding.

### `package.json`
- Defines dependencies: `next`, `react`, `react-dom`, `postgres`, `rss-parser`.
- Dev dependencies for Tailwind, PostCSS, ESLint.
- Scripts: `dev`, `build`, `start`, `lint`.

### `next.config.mjs`
- Minimal Next.js config enabling `reactCompiler`.

### `tailwind.config.js`
- Configures Tailwind content paths and dark mode via class.
- Note: file contains duplicate exports, but the effective configuration is the second `module.exports` block.

### `postcss.config.js`
- Uses `tailwindcss` and `autoprefixer` plugins.

### `eslint.config.mjs`
- Extends Next.js Core Web Vitals ESLint config.
- Defines ignore rules for `.next`, `out`, and `build` directories.

### `vercel.json`
- Not inspected in detail, but typically contains Vercel deployment settings.

---

## App structure

### `app/layout.js`
- Root layout for the Next.js app.
- Loads Google fonts `Geist` and `Geist Mono`.
- Sets HTML metadata for SEO and social sharing.
- Adds an inline script to sync theme mode before hydration:
  - reads `localStorage.theme`
  - if absent, uses `prefers-color-scheme`
  - toggles the `dark` class on `<html>`.
- Wraps page content in a styled `<body>`.

### `app/page.js`
- Main homepage component.
- Fetches the latest 60 articles from the database server-side.
- Renders:
  - sticky header with title and `ThemeToggle`
  - `ResumoDoDia` daily summary panel
  - `ArticleFeed` to show article list, filters, search
  - footer and `ChatBot`
- Uses `sql` from `../lib/db` to query PostgreSQL.

### `app/robots.js`
- Returns robots rules for crawlers.
- Allows public pages and disallows `/api/` routes.
- Points to the sitemap location.

### `app/sitemap.js`
- Generates static sitemap entries for the homepage and key categories.
- Placeholder for dynamic routes if expanded later.

---

## API routes

### `app/api/fetch-feeds/route.js`
- Central RSS ingestion endpoint.
- Intended for cron or manual execution.
- Behavior:
  - deletes articles older than 7 days
  - fetches all RSS sources defined in `lib/sources.js`
  - calls `fetchAndSave(source)` for each feed
  - fetches ECO Sapo items separately via `fetchAndSaveEco()`
  - calls `cleanup_old_articles()` stored procedure if available
- Returns JSON with success/failure lists and timing data.
- Uses `maxDuration = 300` to allow longer execution.

### `app/api/articles/route.js`
- Article query endpoint used by the UI.
- Accepts filters through query parameters:
  - `category`, `categories`, `source`, `sources`, `search`
- Builds arrays for category/source filtering.
- Uses SQL to select articles ordered by `published_at desc`.
- Supports title/description search with `ILIKE`.
- Applies deduplication before returning results.

### `app/api/trending/route.js`
- Calculates trending words from titles in the last 24 hours.
- Gathers up to 200 recent article titles.
- Normalizes and filters words:
  - removes special characters
  - ignores short words and stopwords
  - ignores numeric tokens
- Returns top 10 frequent words.

### `app/api/summarize/route.js`
- AI-driven daily summary endpoint.
- If a recent summary exists (within 3 hours), returns cached version.
- Otherwise:
  - queries last 24h articles' title and source
  - builds a Gemini prompt asking for exactly 5 summary points
  - sends request to Google Gemini API
  - parses returned content
  - attempts to match each summary point to a relevant article URL
  - stores summary and matched points in `summaries` table
- Includes a stopword list and helper logic to infer references.

### `app/api/chat/route.js`
- Handles chat requests from the UI.
- Receives `messages` and `context`.
- Builds a system prompt in Portuguese with journalistic style rules.
- Sends a request to Gemini using the provided API key.
- Returns the AI reply.
- Important: the assistant is instructed to answer based only on news context.

---

## Backend utilities (`lib/`)

### `lib/db.ts`
- Exports a Postgres client from the `postgres` npm package.
- Connects using `process.env.DATABASE_URL`.

### `lib/sources.js`
- List of RSS sources and categories.
- Includes feeds for Noticias ao Minuto, RTP, Renascença, SAPO, Correio da Manhã, Record, Jornal de Negócios, Observador, Público.
- Each item contains `url`, `name`, `category`.

### `lib/fetchFeed.js`
- Reads RSS feeds using `rss-parser`.
- Normalizes item fields and cleans CDATA.
- Supports media enclosures and media tags for thumbnails.
- Parses publication dates with special handling:
  - Lisbon local time for naive timestamps
  - RTP Notícias offset correction (-1 hour)
- Stores articles in PostgreSQL with upsert by `url`:
  - title, description, image_url, published_at, source, category, is_paywall
- Ensures same URL updates rather than inserting duplicates.

### `lib/fetchEco.js`
- Fetches news items from ECO Sapo REST API.
- Maps tags into categories.
- Skips `liveblog` items.
- Upserts ECO articles by URL into the same articles table.
- Includes paywall detection using `item.premium`.

### `lib/deduplicate.js`
- Provides a simple title similarity-based deduplication.
- Computes Jaccard similarity over normalized title words.
- Groups articles with similarity above `0.5`.
- Returns the first article plus an `also_in` array listing other sources with similar stories.
- Used to avoid duplicate headlines from multiple publishers.

---

## UI Components

### `components/ThemeToggle.js`
- Client component to switch dark/light mode.
- Reads saved theme from `localStorage` or system preference.
- Toggles the `dark` class on the document element.

### `components/Trending.js`
- Client component that loads `/api/trending`.
- Displays trending keyword buttons.
- Clicking a word triggers a filtered search in `ArticleFeed`.

### `components/ResumoDoDia.js`
- Client component for the daily summary panel.
- Fetches `/api/summarize` on mount.
- Shows loading state and summary points.
- Supports expand/collapse behavior.
- If point matching found an article URL, displays a link.

### `components/ChatBot.js`
- Client chat widget for asking the news assistant.
- Maintains local message state and daily question limit (3/day) in `localStorage`.
- Offers preset questions for quick use.
- Loads latest article titles using `/api/articles` and sends them as context to `/api/chat`.
- Populates the chat UI with user and assistant messages.

### `components/ArticleFeed.js`
- Main feed component with client-side filtering and pagination.
- Provides search input, category buttons, source toggles, and trending integration.
- Calls `/api/articles` whenever filters or search change.
- Uses an intersection observer to implement infinite scroll.
- Shows skeleton loading states during API requests.
- Renders first article prominently, next 6 in a grid, and remaining articles in a compact list.

### `components/ArticleCard.js`
- Displays individual article cards.
- Format article metadata and publication date.
- Supports image previews and paywall badge.
- Includes share button for Web Share API or clipboard fallback.
- Shows `also_in` sources when the article is deduplicated.

### `components/ArticleSkeleton.js`
- Placeholder visual skeleton used while feed is loading.
- Different sizes for featured, grid, and compact thumbnails.

---

## Data flow and application lifecycle

1. **Ingestion**: `app/api/fetch-feeds` is intended to run on a schedule. It deletes old rows and populates the `articles` table from many RSS endpoints plus ECO Sapo.
2. **Storage**: Articles are stored in PostgreSQL and deduplicated by URL at insert time.
3. **Homepage**: `app/page.js` loads recent articles server-side and renders the main UI.
4. **Article filtering**: `ArticleFeed` calls `/api/articles` with selected categories, sources, and search terms.
5. **Trending**: `/api/trending` extracts top-10 frequent headline words from the last 24h.
6. **Resumen**: `/api/summarize` uses Gemini to generate a daily summary of headlines and stores it in `summaries`.
7. **Chat**: `ChatBot` sends the latest headlines and the user conversation to `/api/chat`, which prompts Gemini for a news-specific response.

---

## Interview-ready talking points

- This is a news aggregator built as a server-rendered Next.js app with client-side interactive filters.
- The app uses a single PostgreSQL database connection and stores normalized article rows.
- RSS ingestion is handled by `rss-parser`, with custom date normalization for Portuguese publishers.
- The system avoids duplicates by upserting on `url` and by grouping similar titles with a deduplication helper.
- AI features are implemented with Google Gemini via two endpoints: summary and chat.
- Trending words are computed server-side from article titles and filtered with stopwords.
- UI uses Tailwind CSS and a responsive, mobile-first feed with infinite scroll.
- Local state is used for theme, search, chat questions remaining, and collapsible summary panel.

---

## Potential gaps / assumptions

- The database schema is not included in the repo, but the code assumes `articles` and `summaries` tables exist with fields matching the queries.
- `fetch-feeds` is likely intended to be triggered by cron or an external scheduler.
- Gemini API usage depends on `GEMINI_API_KEY` in environment variables.
- Search is server-side only and does not use a full-text search index.

---

## Most important files to know

- `app/page.js` — entry point and homepage composition.
- `app/api/articles/route.js` — article query backend.
- `app/api/fetch-feeds/route.js` — ingestion pipeline.
- `app/api/summarize/route.js` — AI summary logic.
- `app/api/chat/route.js` — AI chat logic.
- `lib/fetchFeed.js` — RSS parser and database upsert.
- `lib/deduplicate.js` — article deduplication.
- `components/ArticleFeed.js` — filtering, search, and infinite scroll.
- `components/ChatBot.js` — news chat UX.
- `components/ResumoDoDia.js` — daily AI summary UX.

---

This file is intended to help you explain the codebase structure, implementation logic, and component responsibilities in an interview.
