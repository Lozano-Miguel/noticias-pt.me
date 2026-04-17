export default async function sitemap() {
  const baseUrl = 'https://noticias-pt.me';

  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always', 
      priority: 1.0,
    },
    {
      url: `${baseUrl}/categoria/politica`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categoria/desporto`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categoria/economia`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    }
  ];

  // (You can add your Supabase fetch logic here later just like before, 
  // without the TypeScript 'MetadataRoute' strictness)
  const dynamicRoutes = []; 

  return [...staticRoutes, ...dynamicRoutes];
}