// Controlador de proveedores: listado y administración (crear, editar, eliminar) — solo administrador
import { HttpError } from '../utils/httpError.js'
import { cleanText, parseEmail, parseName, parsePhone, parsePositiveInt } from '../utils/validate.js'
import * as supplierModel from '../models/supplierModel.js'

// Largo máximo de la columna `proveedor.nombre` (ver database/schema.sql)
const MAX_NAME_LENGTH = 100

// Convierte una fila de proveedor en la forma que consume el panel, recibe row
const toSupplierResponse = (row) => ({
  id: Number(row.id),
  name: String(row.name),
  email: String(row.email ?? ''),
  phone: String(row.phone ?? ''),
  userId: row.userId == null ? null : Number(row.userId),
})

// Lee y valida los campos de un proveedor enviados por el administrador; al editar (partial), lo que no se envía queda sin tocar (undefined), recibe body, partial
const parseSupplierBody = (body = {}, partial = false) => {
  const name = parseName(body.name, 'El nombre', MAX_NAME_LENGTH)

  let email = partial ? undefined : null
  if (body.email !== undefined) email = cleanText(body.email) ? parseEmail(body.email) : null

  let phone
  if (!partial || body.phone !== undefined) phone = parsePhone(body.phone)

  return { name, email, phone }
}

// GET /api/suppliers — lista los proveedores (solo administrador), recibe res
export const list = async (_req, res) => {
  res.json((await supplierModel.findAll()).map(toSupplierResponse))
}

// POST /api/suppliers — crea un proveedor (solo administrador), recibe req, res
export const create = async (req, res) => {
  const data = parseSupplierBody(req.body)
  const id = await supplierModel.create(data)
  res.status(201).json({ proveedor: { id, ...data, userId: null } })
}

// PUT /api/suppliers/:id — actualiza un proveedor (solo administrador), recibe req, res
export const update = async (req, res) => {
  const id = parsePositiveInt(req.params.id, 'El identificador de proveedor')
  const data = parseSupplierBody(req.body, true)

  const affected = await supplierModel.update(id, data)
  if (!affected && !(await supplierModel.exists(id))) throw new HttpError(404, 'El proveedor no existe.')

  res.json({ ok: true })
}

// DELETE /api/suppliers/:id — elimina un proveedor; sus productos quedan sin proveedor (solo administrador), recibe req, res
export const remove = async (req, res) => {
  const id = parsePositiveInt(req.params.id, 'El identificador de proveedor')
  if (!(await supplierModel.remove(id))) throw new HttpError(404, 'El proveedor no existe.')
  res.json({ ok: true })
}
