import type { APIRoute } from 'astro'

export const GET: APIRoute = ({ site, url }) => {
  const origin = site ?? url
  return new Response(`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /avaliar-nutricionista/\nSitemap: ${new URL('/sitemap.xml', origin).href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  })
}
