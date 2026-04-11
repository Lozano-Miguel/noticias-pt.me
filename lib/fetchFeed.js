import Parser from "rss-parser";
import { supabase } from "./supabase.js";

function stripCDATA(str) {
  if (!str) return null;
  return str.replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1").trim();
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
      published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
      source: source.name,
      category: source.category,
    };

    await supabase.from("articles").upsert([article], { onConflict: "url" });
    console.log(article.title);
  }
}

export default fetchAndSave;
