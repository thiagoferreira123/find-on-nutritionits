import type { APIRoute } from 'astro'
import { catalogApi } from '../../lib/api-client'
import { captchaFrom, formString, json, publicMutationError } from '../../lib/http'

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData()
  const catalogProfileId = Number(formString(data, 'catalogProfileId'))
  const input = {
    catalogProfileId,
    name: formString(data, 'name'),
    email: formString(data, 'email'),
    phone: formString(data, 'phone'),
    objective: formString(data, 'objective'),
  }
  if (!Number.isInteger(catalogProfileId) || catalogProfileId < 1 || input.name.length < 2 || input.name.length > 155 || input.email.length > 254 || input.phone.length < 8 || input.phone.length > 32 || input.objective.length < 2 || input.objective.length > 500) {
    return json({ message: 'Dados inválidos.' }, 400)
  }
  try { return json(await catalogApi.createLead(input, captchaFrom(data)), 201) } catch (error) { return publicMutationError(error) }
}
