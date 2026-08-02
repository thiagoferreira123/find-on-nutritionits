export interface CatalogCard {
  id: string
  slug: string
  displayName: string
  crn: string | null
  photoUrl: string | null
  specialties: string[]
  priceMin: number | null
  priceMax: number | null
  onlineService: boolean
  whatsapp: string | null
  city: string | null
  state: string | null
  averageRating: number | null
  reviewCount: number
}

export interface CatalogLocation {
  id: string
  sourceLocationId: number | null
  name: string
  city: string | null
  state: string | null
  address: string | null
  publicScheduleEnabled: boolean
  publicScheduleUrl: string | null
}

export interface CatalogReview {
  id: string
  patientName: string
  rating: number
  comment: string | null
  status: string
  createdAt: string
}

export interface CatalogContribution {
  id: string
  questionId: string
  questionTitle: string
  content: string
  createdAt: string
}

export interface CatalogProfile {
  id: string | null
  slug: string
  displayName: string
  crn: string | null
  photoUrl: string | null
  bio: string | null
  specialties: string[]
  followupTypes: string[]
  priceMin: number | null
  priceMax: number | null
  paymentMethods: string[]
  whatsapp: string | null
  instagram: string | null
  website: string | null
  linkedin: string | null
  youtube: string | null
  onlineService: boolean
  isActive: boolean
  locations: CatalogLocation[]
  reviews: CatalogReview[]
  contributions: CatalogContribution[]
}

export interface CatalogListResponse {
  items: CatalogCard[]
  seed: string
  nextCursor: string | null
}

export interface CatalogAnswer {
  id: string
  professionalName: string
  professionalSlug: string
  professionalPhotoUrl: string | null
  content: string
  createdAt: string
  isOwn: boolean
}

export interface CatalogQuestion {
  id: string
  visitorName: string
  title: string
  content: string
  status: string
  createdAt: string
  answers: CatalogAnswer[]
}

export interface CatalogQuestionsResponse {
  items: CatalogQuestion[]
  nextPage: number | null
}

export interface ReviewLinkProfile {
  displayName: string
  photoUrl: string | null
  slug: string
}

export interface CreatedResponse { id: string }

export interface CatalogListFilters {
  state?: string
  city?: string
  name?: string
  specialty?: string
  priceMin?: number
  priceMax?: number
  online?: boolean
  seed?: string
  page?: number
  cursor?: string
}

export interface CreateLeadInput {
  catalogProfileId: number
  name: string
  email: string
  phone: string
  objective: string
}

export interface CreateQuestionInput {
  visitorName: string
  visitorEmail?: string
  title: string
  content: string
}

export interface CreateReviewInput {
  patientName: string
  rating: number
  comment?: string
}

export type MetricEvent = 'page_view' | 'profile_view' | 'whatsapp_click' | 'schedule_click' | 'review_link_view' | 'lead_request'

export interface CreateMetricInput {
  eventType: MetricEvent
  catalogProfileId?: number
  metadata?: Record<string, unknown>
}
