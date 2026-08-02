import { describe, expect, it } from 'vitest'
import {
  buildCanonicalPath,
  buildWhatsappUrl,
  catalogCardMatches,
  catalogDisplayText,
  catalogInitials,
  formatPrice,
  locationSeo,
  parseCatalogSearch,
  specialtySeo,
  serializeJsonLd,
  toReviewSignature,
  visibleCatalogLocations,
  youtubeEmbedUrl,
} from './catalog'
import type { CatalogCard } from './types'

describe('parseCatalogSearch', () => {
  it('normaliza filtros públicos válidos e mantém a página compartilhável', () => {
    const parsed = parseCatalogSearch(new URL('https://example.com/nutricionistas?name= Ana &state=mt&online=true&priceMin=100,50&page=3&seed=abc'))

    expect(parsed).toMatchObject({
      name: 'Ana', state: 'MT', online: 'true', priceMin: '100.50', page: 3, seed: 'abc',
    })
  })

  it('descarta valores inválidos sem enviar filtros incorretos para a API', () => {
    const parsed = parseCatalogSearch(new URL('https://example.com/nutricionistas?state=MATO&online=yes&priceMin=-1&page=0'))

    expect(parsed).toMatchObject({ state: undefined, online: undefined, priceMin: undefined, page: 1 })
  })
})

describe('SEO de páginas indexáveis', () => {
  it('produz URL canônica de paginação', () => {
    expect(buildCanonicalPath('/nutricionistas', 1)).toBe('/nutricionistas')
    expect(buildCanonicalPath('/nutricionistas', 4)).toBe('/nutricionistas?page=4')
  })

  it('produz texto local para cidade e estado', () => {
    expect(locationSeo('mt', 'varzea-grande')).toMatchObject({
      state: 'MT', city: 'Varzea Grande', canonicalPath: '/nutricionistas/mt/varzea-grande',
    })
  })

  it('produz texto para especialidade', () => {
    expect(specialtySeo('nutricao-esportiva')).toMatchObject({
      specialty: 'Nutricao Esportiva',
      canonicalPath: '/nutricionistas/especialidade/nutricao-esportiva',
    })
  })

  it('serializa JSON-LD sem permitir fechamento de script por conteúdo externo', () => {
    expect(serializeJsonLd({ name: '</script><script>alert(1)</script>' })).not.toContain('</script>')
  })
})

describe('apresentação do catálogo', () => {
  const profile: CatalogCard = {
    id: '1',
    slug: 'ana-souza',
    displayName: 'Ana Souza',
    crn: 'CRN-1 1234',
    photoUrl: null,
    specialties: ['Nutrição esportiva', 'Emagrecimento'],
    priceMin: 150,
    priceMax: 250,
    onlineService: true,
    whatsapp: null,
    city: 'Cuiabá',
    state: 'MT',
    averageRating: 4.9,
    reviewCount: 12,
  }

  it('filtra os perfis localmente com texto, modalidade e faixa de valor', () => {
    expect(catalogCardMatches(profile, { page: 1, specialty: 'nutricao', city: 'cuiaba', online: 'true', priceMax: '180' })).toBe(true)
    expect(catalogCardMatches(profile, { page: 1, name: 'outra pessoa' })).toBe(false)
    expect(catalogCardMatches(profile, { page: 1, online: 'false' })).toBe(false)
    expect(catalogCardMatches(profile, { page: 1, priceMin: '300' })).toBe(false)
  })

  it('formata faixas de preço', () => {
    expect(formatPrice(150, 250)).toBe('R$\u00a0150 – R$\u00a0250')
    expect(formatPrice(150, null)).toBe('A partir de R$\u00a0150')
    expect(formatPrice(null, 250)).toBe('Até R$\u00a0250')
    expect(formatPrice(null, null)).toBeNull()
  })

  it('normaliza WhatsApp brasileiro e preserva contexto', () => {
    expect(buildWhatsappUrl('(65) 99999-0000', 'Emagrecimento')).toBe(
      'https://wa.me/5565999990000?text=Ol%C3%A1%2C%20te%20conheci%20no%20site%20do%20DietSystem%20e%20estou%20procurando%20nutricionista%20para%3A%20Emagrecimento',
    )
  })

  it('calcula iniciais sem expor conteúdo como HTML', () => {
    expect(catalogInitials('Ana Souza')).toBe('AS')
    expect(catalogInitials('<script>alert(1)</script>')).not.toContain('<')
  })

  it('trata zero do backend como campo ausente', () => {
    expect(catalogDisplayText(0)).toBeNull()
    expect(catalogDisplayText(' 0 ')).toBeNull()
    expect(catalogDisplayText('Av. Paulista, 1159')).toBe('Av. Paulista, 1159')
  })

  it('remove locais vazios e nunca deixa zero como texto visível', () => {
    expect(visibleCatalogLocations([
      { id: 'empty', sourceLocationId: null, name: '0', city: null, state: null, address: '0', publicScheduleEnabled: 0 as never, publicScheduleUrl: '0', weeklyHours: null },
      { id: 'online', sourceLocationId: null, name: 'Online', city: 'São Paulo', state: 'SP', address: 'Av. Paulista, 1159 - Bela Vista', publicScheduleEnabled: 0 as never, publicScheduleUrl: null, weeklyHours: null },
    ])).toEqual([
      { id: 'online', sourceLocationId: null, name: 'Online', city: 'São Paulo', state: 'SP', address: 'Av. Paulista, 1159 - Bela Vista', publicScheduleEnabled: false, publicScheduleUrl: null, weeklyHours: null },
    ])
  })

  it('converte links YouTube conhecidos em embed seguro', () => {
    expect(youtubeEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')
    expect(youtubeEmbedUrl('https://youtu.be/dQw4w9WgXcQ')).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')
    expect(youtubeEmbedUrl('javascript:alert(1)')).toBeNull()
  })

  it('permite assinatura por iniciais na avaliação sem mudar o contrato da API', () => {
    expect(toReviewSignature('Maria da Silva', true)).toBe('M. D. S.')
    expect(toReviewSignature('Maria da Silva', false)).toBe('Maria da Silva')
  })
})
