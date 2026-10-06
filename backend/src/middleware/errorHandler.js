/**
 * Manejo centralizado de errores.
 * Los controladores y servicios lanzan errores; aquí se convierten en respuestas
 * JSON con el mismo formato que usa el frontend (`statusMessage`).
 */
import { HttpError } from '../utils/httpError.js'

/** Código de MySQL: se intentó borrar una fila que otras tablas referencian. */
const MYSQL_ROW_IS_REFERENCED = 'ER_ROW_IS_REFERENCED_2'
/** Código de MySQL: un texto es más largo que la columna donde se guardaría. */
const MYSQL_DATA_TOO_LONG = 'ER_DATA_TOO_LONG'

/**
 * Responde 404 cuando ninguna ruta coincide con la petición.
 * @param {import('express').Request} req Petición recibida.
 * @param {import('express').Response} _res Respuesta (sin uso).
 * @param {import('express').NextFunction} next Pasa el error al manejador general.
 * @returns {void}
 */
export const notFoundHandler = (req, _res, next) => {
  next(new HttpError(404, `Ruta no encontrada: ${req.method} ${req.path}`))
}

/**
 * Convierte cualquier error en una respuesta JSON.
 * Los HttpError muestran su mensaje; los errores inesperados se registran en el
 * servidor y el cliente solo recibe un mensaje genérico (no se filtran detalles internos).
 * @param {Error & {statusCode?: number, code?: string, type?: string}} error Error capturado.
 * @param {import('express').Request} _req Petición (sin uso).
 * @param {import('express').Response} res Respuesta HTTP.
 * @param {import('express').NextFunction} _next Requerido por Express para identificar un manejador de errores.
 * @returns {void}
 */
export const errorHandler = (error, _req, res, _next) => {
  let statusCode = 500
  let message = 'Error interno del servidor.'

  if (error instanceof HttpError) {
    statusCode = error.statusCode
    message = error.message
  } else if (error.type === 'entity.parse.failed') {
    statusCode = 400
    message = 'El cuerpo de la petición no es un JSON válido.'
  } else if (error.type === 'entity.too.large') {
    statusCode = 413
    message = 'La petición es demasiado grande.'
  } else if (error.code === MYSQL_ROW_IS_REFERENCED) {
    statusCode = 409
    message = 'No se puede eliminar porque está relacionado con otros registros.'
  } else if (error.code === MYSQL_DATA_TOO_LONG) {
    statusCode = 400
    message = 'Uno de los textos enviados es demasiado largo.'
  } else {
    console.error('[error]', error)
  }

  res.status(statusCode).json({ error: true, statusCode, statusMessage: message, message })
}
