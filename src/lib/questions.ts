const MAX_SEARCH_LENGTH = 100

export interface QuestionSearch {
  search: string
  page: number
}

export function parseQuestionSearch(url: URL): QuestionSearch {
  const parsedPage = Number(url.searchParams.get('page'))
  const page = Number.isInteger(parsedPage) && parsedPage >= 1 && parsedPage <= 100 ? parsedPage : 1
  const search = (url.searchParams.get('search') ?? '').trim().slice(0, MAX_SEARCH_LENGTH)

  return { search, page }
}

export function questionPagePath(page: number, search: string): string {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()

  return `/duvidas${query ? `?${query}` : ''}`
}
