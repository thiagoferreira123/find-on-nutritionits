import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8')

describe('fidelidade ao catálogo original', () => {
  it('preserva hero fotográfico, marca DietSystem e filtros progressivos', () => {
    expect(read('../components/CatalogHero.astro')).toContain('class="hero-image"')
    expect(read('../layouts/BaseLayout.astro')).toContain('<span>DietSystem</span>')
    expect(read('../layouts/BaseLayout.astro')).toContain('href="/img/favicon.png"')
    expect(read('../components/CatalogFilters.astro')).toContain('class="advanced"')
    expect(read('../components/CatalogFilters.astro')).toContain('class="segments"')
  })

  it('usa verde nos estados selecionados em vez de fundos pretos', () => {
    expect(read('./global.css')).toContain('.segment:has(input:checked) { border-color: #6bdcab; background: #e8faf2; color: #115b3c; }')
    expect(read('./global.css')).toContain('.page-current { color: #115b3c; background: #e8faf2; border-color: #6bdcab;')
  })

  it('preserva a composição original dos cards sem o selo de perfil novo', () => {
    const card = read('../components/NutritionistCard.astro')
    expect(card).toContain('class="btn btn-primary btn-block"')
    expect(card).not.toContain('card-actions')
    expect(card).not.toContain('Novo no catálogo')
  })

  it('mantém os filtros no navegador sem consultar um endpoint a cada mudança', () => {
    const listing = read('../components/CatalogListing.astro')
    expect(listing).toContain("form?.addEventListener('input', scheduleFilter)")
    expect(listing).toContain('card.hidden = !matches')
    expect(listing).not.toContain('/api/nutritionists.json')
  })
})
