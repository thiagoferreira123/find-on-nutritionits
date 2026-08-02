import type { APIRoute } from 'astro'
import { catalogApi } from '../../lib/api-client'
import { captchaFrom, formString, json, publicMutationError } from '../../lib/http'

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData()
  const visitorEmail = formString(data, 'visitorEmail')
  const input = {
    visitorName: formString(data, 'visitorName'),
    visitorEmail: visitorEmail || undefined,
    title: formString(data, 'title'),
    content: formString(data, 'content'),
  }
  if (input.visitorName.length < 2 || input.visitorName.length > 155 || visitorEmail.length > 256 || input.title.length < 5 || input.title.length > 180 || input.content.length < 10 || input.content.length > 2000) {
    return json({ message: 'Dados inválidos.' }, 400)
  }
  try { return json(await catalogApi.createQuestion(input, captchaFrom(data)), 201) } catch (error) { return publicMutationError(error) }
}
