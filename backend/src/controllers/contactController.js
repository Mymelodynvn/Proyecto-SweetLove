// Controlador de contacto: recibe los mensajes del formulario "Contáctanos" (público) y los administra en "Novedades" (solo administrador)
import { HttpError } from '../utils/httpError.js'
import { cleanText, parseName, parsePhone, parsePositiveInt } from '../utils/validate.js'
import * as contactMessageModel from '../models/contactMessageModel.js'

// Largos de las columnas de `mensaje_contacto` (ver database/schema.sql)
const MAX_NAME_LENGTH = 100
const MIN_SUBJECT_LENGTH = 3
const MAX_SUBJECT_LENGTH = 100
const MIN_MESSAGE_LENGTH = 10
const MAX_MESSAGE_LENGTH = 1000

// Un nombre de persona solo lleva letras (con tildes), espacios, apóstrofes, puntos y guiones
const PERSON_NAME_PATTERN = /^[\p{L}\s'.-]+$/u

// Convierte una fila de mensaje en la forma que consume el panel, recibe row
const toMessageResponse = (row) => ({
  id: Number(row.id),
  name: String(row.name),
  phone: String(row.phone),
  subject: String(row.subject),
  message: String(row.message),
  createdAt: String(row.createdAt),
})

// Valida un texto con largo mínimo y máximo, recibe value, label, min, max
const parseLengthText = (value, label, min, max) => {
  const text = cleanText(value)
  if (text.length < min || text.length > max) throw new HttpError(400, `${label} debe tener entre ${min} y ${max} caracteres.`)
  return text
}

// Lee y valida los campos del formulario de contacto, recibe body
const parseContactBody = (body = {}) => {
  const name = parseName(body.name, 'El nombre', MAX_NAME_LENGTH)
  if (!PERSON_NAME_PATTERN.test(name)) throw new HttpError(400, 'El nombre solo puede tener letras.')

  return {
    name,
    phone: parsePhone(body.phone),
    subject: parseLengthText(body.subject, 'El asunto', MIN_SUBJECT_LENGTH, MAX_SUBJECT_LENGTH),
    message: parseLengthText(body.message, 'El mensaje', MIN_MESSAGE_LENGTH, MAX_MESSAGE_LENGTH),
  }
}

// POST /api/contact — guarda un mensaje del formulario de contacto de la tienda (público), recibe req, res
export const create = async (req, res) => {
  await contactMessageModel.create(parseContactBody(req.body))
  res.status(201).json({ ok: true })
}

// GET /api/contact-messages — lista los mensajes recibidos, del más reciente al más antiguo (solo administrador), recibe res
export const list = async (_req, res) => {
  res.json((await contactMessageModel.findAll()).map(toMessageResponse))
}

// DELETE /api/contact-messages/:id — elimina un mensaje (solo administrador), recibe req, res
export const remove = async (req, res) => {
  const id = parsePositiveInt(req.params.id, 'El identificador de mensaje')
  if (!(await contactMessageModel.remove(id))) throw new HttpError(404, 'El mensaje no existe.')
  res.json({ ok: true })
}
