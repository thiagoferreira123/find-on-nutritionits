import type { APIRoute } from 'astro'
import { catalogApi } from '../lib/api-client'

const escapeXml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

export const GET: APIRoute = async ({ site, url }) => {
  const origin = site ?? url
  const urls = new Set(['/nutricionistas', '/duvidas', '/privacidade', '/termos'])
  let cursor: string | undefined
  let attempts = 0
  do {
    try {
      const page = await catalogApi.list({ seed: 'sitemap', cursor })
      page.items.forEach((profile) => urls.add(`/nutricionistas/${profile.slug}`))
      cursor = page.nextCursor ?? undefined
    } catch {
      cursor = undefined
    }
    attempts += 1
  } while (cursor && attempts < 100)

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...urls].map((path) => `  <url><loc>${escapeXml(new URL(path, origin).href)}</loc></url>`).join('\n')}\n</urlset>\n`
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' } })
}
