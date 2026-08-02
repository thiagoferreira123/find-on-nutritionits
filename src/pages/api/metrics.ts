import type { APIRoute } from 'astro'
import { catalogApi } from '../../lib/api-client'
import { json } from '../../lib/http'
import type { MetricEvent } from '../../lib/types'

const EVENTS = new Set<MetricEvent>(['page_view', 'profile_view', 'whatsapp_click', 'schedule_click', 'review_link_view', 'lead_request'])

export const POST: APIRoute = async ({ request }) => {
  let body: unknown
  try { body = await request.json() } catch { return json({ message: 'Dados inválidos.' }, 400) }
  if (!body || typeof body !== 'object') return json({ message: 'Dados inválidos.' }, 400)
  const payload = body as Record<string, unknown>
  if (typeof payload.eventType !== 'string' || !EVENTS.has(payload.eventType as MetricEvent)) return json({ message: 'Dados inválidos.' }, 400)
  const catalogProfileId = typeof payload.catalogProfileId === 'number' && Number.isInteger(payload.catalogProfileId) && payload.catalogProfileId > 0 ? payload.catalogProfileId : undefined
  try {
    return json(await catalogApi.createMetric({ eventType: payload.eventType as MetricEvent, catalogProfileId }), 201)
  } catch {
    return json({ id: '' }, 202)
  }
}
