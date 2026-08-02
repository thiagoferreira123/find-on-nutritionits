import type { APIRoute } from 'astro'

export const GET: APIRoute = () => new Response(JSON.stringify({ status: 'ok', service: 'find-on-nutritionists' }), {
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
})
