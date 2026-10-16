// Middlewares de autenticación y autorización
import { HttpError } from '../utils/httpError.js'
import { passwordStamp } from '../utils/session.js'
import * as userModel from '../models/userModel.js'

// Identificador del rol Administrador en la tabla `rol`
export const ADMIN_ROLE_ID = 1

// Devuelve el usuario dueño de la sesión, o null si no hay sesión, la cuenta ya no existe o la contraseña cambió después de iniciarla (en ese caso se cierra la sesión), recibe req
export const loadSessionUser = async (req) => {
  if (!req.session?.idUser) return null

  const user = await userModel.findSessionUser(req.session.idUser)
  if (!user || req.session.stamp !== passwordStamp(user.contrasena)) {
    req.session = null
    return null
  }
  return user
}

// Exige que haya un usuario con sesión iniciada y vigente; si no, responde 401, recibe req, next
export const requireUser = async (req, _res, next) => {
  if (!(await loadSessionUser(req))) throw new HttpError(401, 'Debes iniciar sesión.')
  next()
}

// Exige rol Administrador, recibe req, next
export const requireAdmin = async (req, _res, next) => {
  const user = await loadSessionUser(req)
  if (!user) throw new HttpError(401, 'Debes iniciar sesión.')
  if (user.idRol !== ADMIN_ROLE_ID) throw new HttpError(403, 'No tienes permisos para esta acción.')

  next()
}
