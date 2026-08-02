import type { APIRoute } from 'astro'
import { catalogApi } from '../../lib/api-client'
import { json } from '../../lib/http'

export const GET: APIRoute = async ({ url }) => {
  const number = (key: string) => {
    const raw = url.searchParams.get(key)
    const value = raw === null ? undefined : Number(raw)
    return value !== undefined && Number.isFinite(value) && value >= 0 ? value : undefined
  }
  const state = url.searchParams.get('state')?.toUpperCase()
  try {
    const response = await catalogApi.list({
      name: url.searchParams.get('name') || undefined,
      specialty: url.searchParams.get('specialty') || undefined,
      city: url.searchParams.get('city') || undefined,
      state: state && /^[A-Z]{2}$/.test(state) ? state : undefined,
      priceMin: number('priceMin'),
      priceMax: number('priceMax'),
      online: url.searchParams.get('online') === 'true' ? true : url.searchParams.get('online') === 'false' ? false : undefined,
      seed: url.searchParams.get('seed') || undefined,
      page: number('page'),
      cursor: url.searchParams.get('cursor') || undefined,
    })
    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=30, stale-while-revalidate=120' },
    })
  } catch {
    return json({ message: 'Não foi possível carregar os dados agora.' }, 502)
  }
}
