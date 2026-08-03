const MAX_SEARCH_LENGTH = 100

export interface QuestionSearch {
  search: string
  page: number
}

export interface QuestionPageSummary {
  total: number
  answered: number
  waiting: number
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

export function summarizeQuestions(items: readonly { answers: readonly unknown[] }[]): QuestionPageSummary {
  const answered = items.filter((item) => item.answers.length > 0).length

  return { total: items.length, answered, waiting: items.length - answered }
}

export function questionSummaryLabel(summary: QuestionPageSummary, search: string): string {
  const noun = summary.total === 1 ? 'dúvida' : 'dúvidas'
  const scope = search ? `${summary.total} ${noun} para “${search}”` : `${summary.total} ${noun} nesta página`
  const answered = `${summary.answered} ${summary.answered === 1 ? 'respondida' : 'respondidas'}`

  return summary.waiting > 0 ? `${scope} · ${answered} · ${summary.waiting} aguardando resposta` : `${scope} · ${answered}`
}
