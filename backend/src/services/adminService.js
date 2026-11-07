// Servicio de administradores: da y quita el acceso al panel (el rol Administrador de la cuenta)
import bcrypt from 'bcryptjs'
import { HttpError } from '../utils/httpError.js'
import { assertStrongPassword } from '../utils/password.js'
import { ADMIN_ROLE_ID } from '../middleware/auth.js'
import * as userModel from '../models/userModel.js'
import { splitFullName } from './accountService.js'

// Nombres de los roles en la tabla `rol` (ver database/datos-base.sql)
const ADMIN_ROLE = 'Administrador'
const CUSTOMER_ROLE = 'Cliente'

// Da acceso al panel al correo indicado y devuelve { userId, outcome, passwordSet }, recibe fullName, email, phone, password.
// Sin cuenta: la crea como administradora con la contraseña dada. Con cuenta de tienda ya verificada: la convierte y conserva su contraseña.
// Con cuenta sin verificar o de invitado: la convierte y fija la contraseña dada (la que dejó quien se registró no es de fiar). Si ya es administradora, no cambia nada.
export const grantAdmin = async ({ fullName, email, phone, password }) => {
  const existing = await userModel.findByEmail(email)

  if (existing?.idRol === ADMIN_ROLE_ID) return { userId: existing.idUser, outcome: 'already', passwordSet: false }

  // Una cuenta de tienda con el correo verificado ya tiene una contraseña que su dueña eligió
  const keepsOwnPassword = Boolean(existing && existing.emailVerificado && !existing.esInvitado)

  if (!keepsOwnPassword) assertStrongPassword(password, { email, name: fullName })
  const passwordHash = keepsOwnPassword ? null : await bcrypt.hash(password, 10)

  if (!existing) {
    const { nombre, apellido } = splitFullName(fullName)
    const userId = await userModel.create({ nombre, apellido, email, celular: phone, contrasenaHash: passwordHash, rol: ADMIN_ROLE, emailVerificado: true })
    return { userId, outcome: 'created', passwordSet: true }
  }

  if (passwordHash) await userModel.activateWithPassword(existing.idUser, passwordHash)
  await userModel.setRole(existing.idUser, ADMIN_ROLE)
  return { userId: existing.idUser, outcome: 'promoted', passwordSet: Boolean(passwordHash) }
}

// Activa o quita el acceso al panel de una cuenta (al quitarlo pasa a cliente y conserva sus pedidos), recibe targetId, active, actingUserId
export const setAdminAccess = async ({ targetId, active, actingUserId }) => {
  const target = await userModel.findAccountState(targetId)
  if (!target) throw new HttpError(404, 'La cuenta no existe.')

  if (!active) {
    if (targetId === actingUserId) throw new HttpError(409, 'No puedes quitar tu propio acceso al panel.')
    if (target.idRol === ADMIN_ROLE_ID) await userModel.setRole(targetId, CUSTOMER_ROLE)
    return
  }

  if (target.idRol === ADMIN_ROLE_ID) return
  // Sin correo verificado o siendo invitado no se sabe quién es su dueña: hay que crearla de nuevo con una contraseña
  if (!target.emailVerificado || target.esInvitado) {
    throw new HttpError(409, 'Esta cuenta no se puede activar como administradora. Vuelve a agregar a la persona con una contraseña.')
  }
  await userModel.setRole(targetId, ADMIN_ROLE)
}
