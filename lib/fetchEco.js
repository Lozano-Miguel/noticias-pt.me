import supabase from "./supabase.js";

function mapEcoCategory(tags) {
  if (!Array.isArray(tags) || tags.length === 0) {
    return "Economia";
  }

  const slugs = tags.map((tag) => tag?.slug?.toLowerCase()).filter(Boolean);

  if (slugs.includes("desporto")) return "Desporto";
  if (slugs.includes("politica")) return "Política";
  if (slugs.includes("internacional")) return "Mundo";
  if (slugs.includes("capital-verde")) return "Ambiente";
  if (slugs.includes("tecnologia")) return "Tecnologia";
  if (slugs.includes("opiniao")) return "Opinião";
  if (slugs.includes("mercados")) return "Economia";
  if (slugs.includes("empresas")) return "Economia";
  if (slugs.includes("banca")) return "Economia";
  if (slugs.includes("trabalho")) return "Economia";

  return "Economia";
}

async function fetchAndSaveEco() {
  try {
    const response = await fetch("https://eco.sapo.pt/wp-json/eco/v1/items");
    const items = await response.json();

    if (!Array.isArray(items)) {
      console.error("fetchAndSaveEco: expected array response", items);
      return;
    }

    for (const item of items) {
      if (item?.type === "liveblog") {
        continue;
      }

      const url = item?.links?.webUri || null;
      if (!url) {
        continue;
      }

      const article = {
        title: item?.title?.short || item?.title?.long || null,
        description: item?.lead || null,
        url,
        image_url: item?.images?.wide?.urlTemplate || null,
        published_at: item?.pubDate ? new Date(item.pubDate).toISOString() : null,
        source: "ECO Sapo",
        category: mapEcoCategory(item?.metadata?.tags),
        is_paywall: item?.premium === true,
      };

      const { error } = await supabase
        .from("articles")
        .upsert(article, { onConflict: "url" });

      if (error) {
        console.error("fetchAndSaveEco upsert error:", error.message);
      }
    }
  } catch (error) {
    console.error("fetchAndSaveEco error:", error?.message ?? error);
  }
}

export default fetchAndSaveEco;
