import Parser from "rss-parser";
import { supabase } from "./supabase.js";

function stripCDATA(str) {
  if (!str) return null;
  return str.replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1").trim();
}

function parsePubDate(pubDate) {
  if (!pubDate) return null;
  // If format is YYYY-MM-DD HH:MM:SS with no timezone, treat as Europe/Lisbon
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(pubDate.trim())) {
    return new Date(pubDate.trim().replace(" ", "T") + "+01:00").toISOString();
  }
  return new Date(pubDate).toISOString();
}

const parser = new Parser({
  timeout: 10000,
  customFields: {
    item: [
      ["media:content", "mediaContent"],
      ["media:thumbnail", "mediaThumbnail"],
    ],
  },
});

async function fetchAndSave(source) {
  const feedPromise = parser.parseURL(source.url);
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Timeout after 10s")), 10000),
  );
  const feed = await Promise.race([feedPromise, timeoutPromise]);

  for (const item of feed.items ?? []) {
    const article = {
      title: stripCDATA(item.title),
      description: stripCDATA(
        item.contentSnippet || item.content || null,
      ),
      url: item.link,
      image_url:
        item.enclosure?.url ||
        item.mediaContent?.$.url ||
        item.mediaThumbnail?.$.url ||
        null,
      published_at: item.pubDate ? parsePubDate(item.pubDate) : null,
      source: source.name,
      category: source.category,
      is_paywall: source.is_paywall === true ? true : false,
    };

    await supabase.from("articles").upsert([article], { onConflict: "url" });
    console.log(article.title);
  }
}

export default fetchAndSave;
