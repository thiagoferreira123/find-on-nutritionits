import type { CatalogLocation } from './types'

export const CATALOG_WHATSAPP_MESSAGE =
  'Olá, te conheci no site do DietSystem e estou procurando nutricionista para: '

export interface CatalogSearch {
  name?: string
  specialty?: string
  city?: string
  state?: string
  priceMin?: string
  priceMax?: string
  online?: 'true' | 'false'
  seed?: string
  page: number
}

export interface CatalogSeoCopy {
  title: string
  heading: string
  description: string
  intro: string
  canonicalPath: string
}

const cleanText = (value: string | null, maxLength: number): string | undefined => {
  const clean = value?.trim()
  return clean && clean.length <= maxLength ? clean : undefined
}

const cleanPrice = (value: string | null): string | undefined => {
  const clean = value?.trim().replace(',', '.')
  if (!clean || !/^\d+(?:\.\d+)?$/.test(clean)) return undefined
  const parsed = Number(clean)
  return Number.isFinite(parsed) && parsed >= 0 ? clean : undefined
}

export function parseCatalogSearch(url: URL): CatalogSearch {
  const state = url.searchParams.get('state')?.trim().toUpperCase()
  const online = url.searchParams.get('online')
  const page = Number(url.searchParams.get('page'))
  return {
    name: cleanText(url.searchParams.get('name'), 100),
    specialty: cleanText(url.searchParams.get('specialty'), 100),
    city: cleanText(url.searchParams.get('city'), 64),
    state: state && /^[A-Z]{2}$/.test(state) ? state : undefined,
    priceMin: cleanPrice(url.searchParams.get('priceMin')),
    priceMax: cleanPrice(url.searchParams.get('priceMax')),
    online: online === 'true' || online === 'false' ? online : undefined,
    seed: cleanText(url.searchParams.get('seed'), 64),
    page: Number.isInteger(page) && page >= 1 && page <= 1000 ? page : 1,
  }
}

export function toApiFilters(search: CatalogSearch) {
  return {
    name: search.name,
    specialty: search.specialty,
    city: search.city,
    state: search.state,
    priceMin: search.priceMin === undefined ? undefined : Number(search.priceMin),
    priceMax: search.priceMax === undefined ? undefined : Number(search.priceMax),
    online: search.online === undefined ? undefined : search.online === 'true',
    seed: search.seed,
    page: search.page > 1 ? search.page : undefined,
  }
}

export function searchParams(search: CatalogSearch, overrides: Partial<CatalogSearch> = {}): URLSearchParams {
  const value = { ...search, ...overrides }
  const params = new URLSearchParams()
  for (const [key, item] of Object.entries(value)) {
    if (item !== undefined && item !== '' && !(key === 'page' && item === 1)) params.set(key, String(item))
  }
  return params
}

export function buildCanonicalPath(path: string, page: number): string {
  return page > 1 ? `${path}?page=${page}` : path
}

const slugToTitle = (slug: string) => slug.split('-').filter(Boolean)
  .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`).join(' ')

export function locationSeo(stateSlug: string, citySlug: string): CatalogSeoCopy & { state: string; city: string } {
  const state = stateSlug.toUpperCase()
  const city = slugToTitle(citySlug)
  return {
    state,
    city,
    title: `Nutricionistas em ${city}, ${state} | DietSystem`,
    heading: `Nutricionistas em ${city}, ${state}`,
    description: `Encontre nutricionistas em ${city}, ${state}, compare especialidades e escolha atendimento presencial ou online.`,
    intro: `Profissionais que atendem em ${city}, ${state}, com perfis, especialidades e avaliações para ajudar na sua escolha.`,
    canonicalPath: `/nutricionistas/${stateSlug.toLowerCase()}/${citySlug.toLowerCase()}`,
  }
}

export function specialtySeo(specialtySlug: string): CatalogSeoCopy & { specialty: string } {
  const specialty = slugToTitle(specialtySlug)
  return {
    specialty,
    title: `Nutricionistas especialistas em ${specialty} | DietSystem`,
    heading: `Nutricionistas especialistas em ${specialty}`,
    description: `Encontre nutricionistas com atuação em ${specialty}, compare perfis e escolha atendimento online ou presencial.`,
    intro: `Compare profissionais que atuam em ${specialty}, conheça suas credenciais e encontre o acompanhamento ideal.`,
    canonicalPath: `/nutricionistas/especialidade/${specialtySlug.toLowerCase()}`,
  }
}

export function buildWhatsappUrl(phone: string, context?: string): string {
  const digits = phone.replace(/\D/g, '')
  const number = digits.startsWith('55') ? digits : `55${digits}`
  return `https://wa.me/${number}?text=${encodeURIComponent(`${CATALOG_WHATSAPP_MESSAGE}${context?.trim() ?? ''}`)}`
}

export function formatPrice(min: number | null, max: number | null): string | null {
  const money = (value: number) => `R$\u00a0${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
  if (min !== null && max !== null) return `${money(min)} – ${money(max)}`
  if (min !== null) return `A partir de ${money(min)}`
  if (max !== null) return `Até ${money(max)}`
  return null
}

export function catalogInitials(name: string): string {
  return name.split(/\s+/).map((part) => part.match(/[\p{L}\p{N}]/u)?.[0] ?? '')
    .filter(Boolean).slice(0, 2).join('').toUpperCase()
}

export function catalogDisplayText(value: unknown): string | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null
  const text = String(value).trim()
  return text && text !== '0' ? text : null
}

export function visibleCatalogLocations(locations: CatalogLocation[]): CatalogLocation[] {
  return locations.map((location) => {
    const scheduleFlag: unknown = location.publicScheduleEnabled
    return {
      ...location,
      name: catalogDisplayText(location.name) ?? '',
      city: catalogDisplayText(location.city),
      state: catalogDisplayText(location.state),
      address: catalogDisplayText(location.address),
      publicScheduleEnabled: scheduleFlag === true || scheduleFlag === 1 || scheduleFlag === '1',
      publicScheduleUrl: catalogDisplayText(location.publicScheduleUrl),
    }
  }).filter((location) => Boolean(
    location.name || location.city || location.state || location.address ||
    (location.publicScheduleEnabled && location.publicScheduleUrl),
  ))
}

export function youtubeEmbedUrl(value: string | null | undefined): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    let id: string | null = null
    if (url.hostname === 'youtu.be') id = url.pathname.split('/').filter(Boolean)[0] ?? null
    if (url.hostname === 'youtube.com' || url.hostname === 'www.youtube.com') {
      id = url.searchParams.get('v') ?? (url.pathname.startsWith('/embed/') ? url.pathname.split('/')[2] ?? null : null)
    }
    return id && /^[\w-]{6,20}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null
  } catch {
    return null
  }
}

export function toReviewSignature(name: string, initialsOnly: boolean): string {
  if (!initialsOnly) return name.trim()
  return name.trim().split(/\s+/).filter(Boolean).map((part) => `${part[0]?.toUpperCase()}.`).join(' ')
}

export function formatReviewDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value
}

export function safeExternalUrl(value: string | null | undefined): string | null {
  if (!value) return null
  try {
    const url = new URL(value.startsWith('http') ? value : `https://${value}`)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

export function instagramUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  if (!trimmed) return null
  const username = trimmed.replace(/^https?:\/\/(www\.)?/i, '').replace(/^instagram\.com\//i, '')
    .split(/[/?#]/, 1)[0]?.replace(/^@+/, '')
  return username ? `https://www.instagram.com/${encodeURIComponent(username)}` : null
}
