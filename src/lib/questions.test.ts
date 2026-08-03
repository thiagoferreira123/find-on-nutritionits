import { describe, expect, it } from 'vitest'
import { parseQuestionSearch, questionPagePath } from './questions'

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
