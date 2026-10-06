// Middlewares de autenticación y autorización
import { HttpError } from '../utils/httpError.js'
import * as userModel from '../models/userModel.js'

// Identificador del rol Administrador en la tabla `rol`
export const ADMIN_ROLE_ID = 1

// Exige que haya un usuario con sesión iniciada; si no, responde 401, recibe req, next
export const requireUser = (req, _res, next) => {
  if (!req.session?.idUser) throw new HttpError(401, 'Debes iniciar sesión.')
  next()
}

// Exige rol Administrador, recibe req, next
export const requireAdmin = async (req, _res, next) => {
  if (!req.session?.idUser) throw new HttpError(401, 'Debes iniciar sesión.')

  const user = await userModel.findById(req.session.idUser)
  if (!user || user.idRol !== ADMIN_ROLE_ID) throw new HttpError(403, 'No tienes permisos para esta acción.')

  next()
}
