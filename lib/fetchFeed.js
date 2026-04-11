import Parser from "rss-parser";
import { supabase } from "./supabase.js";

const parser = new Parser();

async function fetchAndSave(source) {
  const feed = await parser.parseURL(source.url);

  for (const item of feed.items ?? []) {
    const article = {
      title: item.title,
      description: item.contentSnippet || item.content || null,
      url: item.link,
      image_url: item.enclosure?.url || null,
      published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
      source: source.name,
      category: source.category,
    };

    await supabase.from("articles").upsert([article], { onConflict: "url" });
    console.log(article.title);
  }
}

export default fetchAndSave;
