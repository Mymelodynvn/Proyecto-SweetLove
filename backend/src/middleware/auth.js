/**
 * Middlewares de autenticación y autorización.
 * La sesión es una cookie firmada (ver app.js). Aquí se decide si la petición
 * puede continuar según quién la hace.
 */
import { HttpError } from '../utils/httpError.js'
import * as userModel from '../models/userModel.js'

/** Identificador del rol Administrador en la tabla `rol`. */
export const ADMIN_ROLE_ID = 1

/**
 * Exige que haya un usuario con sesión iniciada; si no, responde 401.
 * @param {import('express').Request} req Petición (usa req.session).
 * @param {import('express').Response} _res Respuesta (sin uso).
 * @param {import('express').NextFunction} next Continúa la cadena de middlewares.
 * @returns {void}
 */
export const requireUser = (req, _res, next) => {
  if (!req.session?.idUser) throw new HttpError(401, 'Debes iniciar sesión.')
  next()
}

/**
 * Exige rol Administrador. Consulta el rol actual en la base de datos (no solo
 * la cookie) para que quitarle el rol a alguien surta efecto de inmediato.
 * Responde 401 sin sesión y 403 si el usuario no es administrador.
 * @param {import('express').Request} req Petición (usa req.session).
 * @param {import('express').Response} _res Respuesta (sin uso).
 * @param {import('express').NextFunction} next Continúa la cadena de middlewares.
 * @returns {Promise<void>}
 */
export const requireAdmin = async (req, _res, next) => {
  if (!req.session?.idUser) throw new HttpError(401, 'Debes iniciar sesión.')

  const user = await userModel.findById(req.session.idUser)
  if (!user || user.idRol !== ADMIN_ROLE_ID) throw new HttpError(403, 'No tienes permisos para esta acción.')

  next()
}
