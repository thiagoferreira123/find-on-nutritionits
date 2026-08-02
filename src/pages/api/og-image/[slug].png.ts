import type { APIRoute } from 'astro'
import { catalogApi } from '../../../lib/api-client'

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug ?? ''
  const baseUrl = (process.env.API_BASE_URL ?? 'https://api.dietsystem.com.br/api').replace(/\/+$/, '')
  try {
    const response = await fetch(`${baseUrl}/public/nutritionists/${encodeURIComponent(slug)}/og-image.png`, { signal: AbortSignal.timeout(8_000) })
    if (response.ok && response.body) {
      return new Response(response.body, {
        headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400', 'X-Content-Type-Options': 'nosniff' },
      })
    }
  } catch {
    // A implantação anterior da API ainda não expõe a imagem dinâmica.
  }
  try {
    const profile = await catalogApi.profile(slug)
    if (profile.photoUrl) return Response.redirect(profile.photoUrl, 302)
  } catch {
    // Usa a imagem neutra abaixo para perfis indisponíveis.
  }
  return Response.redirect(new URL('/img/catalog-hero.webp', process.env.PUBLIC_SITE_URL ?? 'https://encontre-um-nutri.dietsystem.com.br'), 302)
}
