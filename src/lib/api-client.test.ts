import { afterEach, describe, expect, it, vi } from 'vitest'
import { CatalogApi, CatalogApiError } from './api-client'

afterEach(() => vi.unstubAllGlobals())

describe('CatalogApi', () => {
  it('codifica apenas filtros definidos ao listar profissionais', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ items: [], seed: 's', nextCursor: null }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const api = new CatalogApi('https://api.example.com/api')
    await api.list({ city: 'Cuiabá', state: 'MT', online: true, page: 2 })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/api/public/nutritionists?city=Cuiab%C3%A1&state=MT&online=true&page=2',
      expect.objectContaining({ headers: expect.objectContaining({ Accept: 'application/json' }) }),
    )
  })

  it('aplica timeout e não vaza o detalhe interno em erro público', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('segredo interno', { status: 500 })))
    const api = new CatalogApi('https://api.example.com/api')

    await expect(api.profile('ana')).rejects.toEqual(expect.objectContaining({ status: 500, message: 'Não foi possível carregar os dados agora.' }))
  })

  it('distingue perfil inexistente por status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 404 })))
    const api = new CatalogApi('https://api.example.com/api')

    await expect(api.profile('inexistente')).rejects.toBeInstanceOf(CatalogApiError)
    await expect(api.profile('inexistente')).rejects.toMatchObject({ status: 404 })
  })

  it('encaminha CAPTCHA somente ao backend e nunca o persiste na URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: '1' }), { status: 201 }))
    vi.stubGlobal('fetch', fetchMock)
    const api = new CatalogApi('https://api.example.com/api')

    await api.createLead({ catalogProfileId: 1, name: 'Ana', email: 'a@b.com', phone: '65999990000', objective: 'Consulta' }, 'captcha-secret')

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/api/public/leads',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'x-captcha-token': 'captcha-secret' }),
      }),
    )
  })

  it('mantém paginação compatível enquanto a API antiga ainda rejeita page', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response('{}', { status: 400 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: [{ id: '1' }], seed: 's', nextCursor: 'cursor-1' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: [{ id: '2' }], seed: 's', nextCursor: null }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    const api = new CatalogApi('https://api.example.com/api')

    const page = await api.list({ seed: 's', page: 2 })

    expect(page.items).toEqual([{ id: '2' }])
    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://api.example.com/api/public/nutritionists?seed=s&cursor=cursor-1',
      expect.any(Object),
    )
  })

  it('carrega o catálogo completo sem enviar filtros de interface à API', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: [{ id: '1', slug: 'ana' }], seed: 's', nextCursor: 'cursor-1' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: [{ id: '2', slug: 'bia' }], seed: 's', nextCursor: null }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    const api = new CatalogApi('https://api.example.com/api')

    const catalog = await api.listAll('s')

    expect(catalog.items).toEqual([{ id: '1', slug: 'ana' }, { id: '2', slug: 'bia' }])
    expect(fetchMock).toHaveBeenNthCalledWith(1, 'https://api.example.com/api/public/nutritionists?seed=s', expect.any(Object))
    expect(fetchMock).toHaveBeenNthCalledWith(2, 'https://api.example.com/api/public/nutritionists?seed=s&cursor=cursor-1', expect.any(Object))
  })
})
