// Controlador de administradores: dar y quitar el acceso al panel (solo administrador)
import { HttpError } from '../utils/httpError.js'
import { parseEmail, parseName, parsePhone, parsePositiveInt } from '../utils/validate.js'
import * as adminService from '../services/adminService.js'

// Largo de las columnas usuario.nombre + apellido (ver database/schema.sql)
const MAX_FULL_NAME_LENGTH = 100

// POST /api/admins — da acceso al panel a un correo: crea la cuenta administradora o convierte una existente; responde { userId, outcome, passwordSet }, recibe req, res
export const grant = async (req, res) => {
  const result = await adminService.grantAdmin({
    fullName: parseName(req.body?.name, 'El nombre', MAX_FULL_NAME_LENGTH),
    email: parseEmail(req.body?.email),
    phone: parsePhone(req.body?.phone),
    password: String(req.body?.password ?? ''),
  })
  res.status(201).json({ ok: true, ...result })
}

// PATCH /api/admins/:id — activa (active: true) o quita (active: false) el acceso al panel de una cuenta; no se puede quitar el propio, recibe req, res
export const setAccess = async (req, res) => {
  const targetId = parsePositiveInt(req.params.id, 'El identificador de cuenta')
  if (typeof req.body?.active !== 'boolean') throw new HttpError(400, 'Indica si el acceso queda activo (true) o no (false).')

  await adminService.setAdminAccess({ targetId, active: req.body.active, actingUserId: req.session.idUser })
  res.json({ ok: true })
}
