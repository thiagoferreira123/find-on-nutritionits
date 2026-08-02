import type {
  CatalogListFilters,
  CatalogListResponse,
  CatalogProfile,
  CatalogQuestionsResponse,
  CreateLeadInput,
  CreateMetricInput,
  CreateQuestionInput,
  CreateReviewInput,
  CreatedResponse,
  ReviewLinkProfile,
} from './types'

const PUBLIC_ERROR = 'Não foi possível carregar os dados agora.'

export class CatalogApiError extends Error {
  constructor(public readonly status: number, message = PUBLIC_ERROR) {
    super(message)
    this.name = 'CatalogApiError'
  }
}

export class CatalogApi {
  private readonly baseUrl: string

  constructor(baseUrl = process.env.API_BASE_URL ?? 'https://api.dietsystem.com.br/api') {
    this.baseUrl = baseUrl.replace(/\/+$/, '')
  }

  async list(filters: CatalogListFilters): Promise<CatalogListResponse> {
    try {
      return await this.listRequest(filters)
    } catch (error) {
      if (!(error instanceof CatalogApiError) || error.status !== 400 || filters.page === undefined) throw error
      return this.listLegacyPage(filters)
    }
  }

  private listRequest(filters: CatalogListFilters): Promise<CatalogListResponse> {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== '') params.set(key, String(value))
    }
    return this.request(`/public/nutritionists?${params.toString()}`)
  }

  private async listLegacyPage(filters: CatalogListFilters): Promise<CatalogListResponse> {
    const { page = 1, ...legacyFilters } = filters
    if (legacyFilters.cursor) return this.listRequest(legacyFilters)

    let cursor: string | undefined
    let previousSeed = legacyFilters.seed ?? ''
    for (let current = 1; current <= page; current += 1) {
      const response = await this.listRequest({ ...legacyFilters, cursor })
      previousSeed = response.seed
      if (current === page) return response
      cursor = response.nextCursor ?? undefined
      if (!cursor) return { items: [], seed: previousSeed, nextCursor: null }
    }
    return { items: [], seed: previousSeed, nextCursor: null }
  }

  profile(slug: string): Promise<CatalogProfile> {
    return this.request(`/public/nutritionists/${encodeURIComponent(slug)}`)
  }

  questions(page: number): Promise<CatalogQuestionsResponse> {
    return this.request(`/public/questions?page=${page}`)
  }

  reviewLink(token: string): Promise<ReviewLinkProfile> {
    return this.request(`/public/review-links/${encodeURIComponent(token)}`)
  }

  createLead(input: CreateLeadInput, captchaToken?: string): Promise<CreatedResponse> {
    return this.request('/public/leads', { method: 'POST', body: JSON.stringify(input) }, captchaToken)
  }

  createQuestion(input: CreateQuestionInput, captchaToken?: string): Promise<CreatedResponse> {
    return this.request('/public/questions', { method: 'POST', body: JSON.stringify(input) }, captchaToken)
  }

  createReview(token: string, input: CreateReviewInput, captchaToken?: string): Promise<CreatedResponse> {
    return this.request(`/public/reviews/${encodeURIComponent(token)}`, { method: 'POST', body: JSON.stringify(input) }, captchaToken)
  }

  createMetric(input: CreateMetricInput): Promise<CreatedResponse> {
    return this.request('/public/metrics', { method: 'POST', body: JSON.stringify(input) })
  }

  private async request<T>(path: string, init: RequestInit = {}, captchaToken?: string): Promise<T> {
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (init.body) headers['Content-Type'] = 'application/json'
    if (captchaToken) headers['x-captcha-token'] = captchaToken
    let response: Response
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        headers,
        signal: AbortSignal.timeout(8_000),
      })
    } catch {
      throw new CatalogApiError(503)
    }
    if (!response.ok) throw new CatalogApiError(response.status)
    return response.json() as Promise<T>
  }
}

export const catalogApi = new CatalogApi()
