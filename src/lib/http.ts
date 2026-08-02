import { CatalogApiError } from './api-client'

export const json = (body: unknown, status = 200): Response => new Response(JSON.stringify(body), {
  status,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  },
})

export const publicMutationError = (error: unknown): Response => {
  const status = error instanceof CatalogApiError && error.status >= 400 && error.status < 500 ? error.status : 502
  return json({ message: 'Não foi possível concluir a solicitação agora.' }, status)
}

export const formString = (data: FormData, key: string): string => {
  const value = data.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

export const captchaFrom = (data: FormData): string | undefined => {
  const value = formString(data, 'h-captcha-response')
  return value || undefined
}
