export default function sitemap() {
  return [
    {
      url: "https://noticias-pt.me",
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: "https://noticias-pt.me/sobre",
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}