export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/', // Keeps Google from trying to index your backend API routes
    },
    sitemap: 'https://noticias-pt.me/sitemap.xml',
  }
}