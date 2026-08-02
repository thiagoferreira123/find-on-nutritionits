import type { APIRoute } from 'astro'
import { catalogApi } from '../../../lib/api-client'
import { captchaFrom, formString, json, publicMutationError } from '../../../lib/http'

export const POST: APIRoute = async ({ request, params }) => {
  const token = params.token ?? ''
  const data = await request.formData()
  const patientName = formString(data, 'patientName')
  const rating = Number(formString(data, 'rating'))
  const comment = formString(data, 'comment')
  if (!token || patientName.length < 2 || patientName.length > 155 || !Number.isInteger(rating) || rating < 1 || rating > 5 || comment.length > 2000) {
    return json({ message: 'Dados inválidos.' }, 400)
  }
  try {
    return json(await catalogApi.createReview(token, { patientName, rating, comment: comment || undefined }, captchaFrom(data)), 201)
  } catch (error) {
    return publicMutationError(error)
  }
}
