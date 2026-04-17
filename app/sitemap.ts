import { MetadataRoute } from 'next';
// Import your Supabase client (adjust the path to wherever your lib is)
// import { createClient } from '@/lib/supabase/server'; 

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://noticias-pt.me';

  // 1. Define your static core routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always', // Tells Google the homepage changes constantly
      priority: 1.0,
    },
    // Add your main category pages
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
    },
  ];

  // 2. Fetch your dynamic routes (e.g., your clustered articles)
  // Uncomment and adjust this based on your actual database schema
  /*
  const supabase = createClient();
  const { data: articles } = await supabase
    .from('articles') // or 'clusters'
    .select('slug, updated_at')
    .order('updated_at', { ascending: false })
    .limit(500); // Google allows up to 50,000 URLs per sitemap, but keep it manageable
  
  const dynamicRoutes: MetadataRoute.Sitemap = articles?.map((article) => ({
    url: `${baseUrl}/artigo/${article.slug}`,
    lastModified: new Date(article.updated_at),
    changeFrequency: 'daily',
    priority: 0.6,
  })) || [];
  */

  const dynamicRoutes: MetadataRoute.Sitemap = []; // Remove this line once you uncomment the Supabase fetch

  return [...staticRoutes, ...dynamicRoutes];
}