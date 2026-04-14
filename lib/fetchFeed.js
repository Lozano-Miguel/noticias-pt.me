import Parser from "rss-parser";
import { supabase } from "./supabase.js";

function stripCDATA(str) {
  if (!str) return null;
  return str.replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1").trim();
}

function getTimeZoneOffsetMs(date, timeZone) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const tzName = dtf
    .formatToParts(date)
    .find((p) => p.type === "timeZoneName")?.value;

  // Examples: "GMT+1", "GMT+01:00", "GMT"
  const m = tzName?.match(/^GMT(?:(\+|-)(\d{1,2})(?::?(\d{2}))?)?$/);
  if (!m) return 0;
  const sign = m[1] === "-" ? -1 : 1;
  const hours = m[2] ? Number(m[2]) : 0;
  const minutes = m[3] ? Number(m[3]) : 0;
  return sign * (hours * 60 + minutes) * 60 * 1000;
}

function parseLisbonNaiveDateTimeToISOString(pubDate) {
  // pubDate format: YYYY-MM-DD HH:MM:SS (no timezone)
  const [datePart, timePart] = pubDate.trim().split(" ");
  const [y, mo, d] = datePart.split("-").map(Number);
  const [hh, mm, ss] = timePart.split(":").map(Number);

  // Treat the provided clock time as Europe/Lisbon local time (with DST),
  // then convert to an absolute UTC instant.
  const assumedUtc = new Date(Date.UTC(y, mo - 1, d, hh, mm, ss));
  const offsetMs = getTimeZoneOffsetMs(assumedUtc, "Europe/Lisbon");
  return new Date(assumedUtc.getTime() - offsetMs).toISOString();
}

function parsePubDate(pubDate, sourceName) {
  if (!pubDate) return null;
  // If format is YYYY-MM-DD HH:MM:SS with no timezone, treat as Europe/Lisbon
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(pubDate.trim())) {
    return parseLisbonNaiveDateTimeToISOString(pubDate);
  }

  const ms = Date.parse(pubDate);
  if (Number.isNaN(ms)) return null;

  // RTP Notícias RSS consistently comes in one hour ahead; normalize here so
  // the database stores the correct instant and UI renders correctly.
  const normalizedMs =
    sourceName === "RTP Notícias" ? ms - 60 * 60 * 1000 : ms;

  return new Date(normalizedMs).toISOString();
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
      published_at: item.pubDate ? parsePubDate(item.pubDate, source.name) : null,
      source: source.name,
      category: source.category,
      is_paywall: source.is_paywall === true ? true : false,
    };

    await supabase.from("articles").upsert([article], { onConflict: "url" });
    console.log(article.title);
  }
}

export default fetchAndSave;
