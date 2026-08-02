import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8')

describe('fidelidade ao catálogo original', () => {
  it('preserva hero fotográfico, marca DietSystem e filtros progressivos', () => {
    expect(read('../components/CatalogHero.astro')).toContain('class="hero-image"')
    expect(read('../layouts/BaseLayout.astro')).toContain('<span>DietSystem</span>')
    expect(read('../components/CatalogFilters.astro')).toContain('class="advanced"')
    expect(read('../components/CatalogFilters.astro')).toContain('class="segments"')
  })

  it('preserva a composição original dos cards sem o selo de perfil novo', () => {
    const card = read('../components/NutritionistCard.astro')
    expect(card).toContain('class="btn btn-primary btn-block"')
    expect(card).not.toContain('card-actions')
    expect(card).not.toContain('Novo no catálogo')
  })
})
