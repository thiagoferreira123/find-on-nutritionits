import { describe, expect, it } from 'vitest'
import { parseQuestionSearch, questionPagePath, questionSummaryLabel, summarizeQuestions } from './questions'

describe('question search', () => {
  it('normalizes the title term and bounded page from the URL', () => {
    const url = new URL('https://example.com/duvidas?search=%20Vitamin%20D%20&page=2')

    expect(parseQuestionSearch(url)).toEqual({ search: 'Vitamin D', page: 2 })
  })

  it('preserves the title term in pagination links', () => {
    expect(questionPagePath(3, 'Vitamin D & calcium')).toBe('/duvidas?search=Vitamin+D+%26+calcium&page=3')
    expect(questionPagePath(1, 'Vitamin D')).toBe('/duvidas?search=Vitamin+D')
  })
})

describe('question page summary', () => {
  it('splits the visible page between answered and waiting questions', () => {
    const summary = summarizeQuestions([{ answers: [1] }, { answers: [] }, { answers: [1, 2] }])

    expect(summary).toEqual({ total: 3, answered: 2, waiting: 1 })
  })

  it('reports the searched term instead of the page scope', () => {
    const summary = summarizeQuestions([{ answers: [1] }, { answers: [] }])

    expect(questionSummaryLabel(summary, 'vitamina D')).toBe('2 dúvidas para “vitamina D” · 1 respondida · 1 aguardando resposta')
  })

  it('omits the waiting count when every question was answered', () => {
    expect(questionSummaryLabel(summarizeQuestions([{ answers: [1] }]), '')).toBe('1 dúvida nesta página · 1 respondida')
  })
})
