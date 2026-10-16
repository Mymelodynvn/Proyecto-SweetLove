// Manejo centralizado de errores
import { HttpError } from '../utils/httpError.js'

// Código de MySQL: se intentó borrar una fila que otras tablas referencian
const MYSQL_ROW_IS_REFERENCED = 'ER_ROW_IS_REFERENCED_2'
// Código de MySQL: un texto es más largo que la columna donde se guardaría
const MYSQL_DATA_TOO_LONG = 'ER_DATA_TOO_LONG'
// Códigos de MySQL: un número no cabe en su columna, o se apunta a un registro que no existe
const MYSQL_OUT_OF_RANGE = ['ER_WARN_DATA_OUT_OF_RANGE', 'ER_DATA_OUT_OF_RANGE']
const MYSQL_NO_REFERENCED_ROW = 'ER_NO_REFERENCED_ROW_2'

// Responde 404 cuando ninguna ruta coincide con la petición, recibe req, next
export const notFoundHandler = (req, _res, next) => {
  next(new HttpError(404, `Ruta no encontrada: ${req.method} ${req.path}`))
}

// Convierte cualquier error en una respuesta JSON, recibe error, res
export const errorHandler = (error, _req, res, _next) => {
  let statusCode = 500
  let message = 'Error interno del servidor.'
  let code

  if (error instanceof HttpError) {
    statusCode = error.statusCode
    message = error.message
    code = error.code
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
  } else if (MYSQL_OUT_OF_RANGE.includes(error.code)) {
    statusCode = 400
    message = 'Uno de los números enviados está fuera del rango permitido.'
  } else if (error.code === MYSQL_NO_REFERENCED_ROW) {
    statusCode = 400
    message = 'Uno de los datos enviados apunta a un registro que no existe.'
  } else {
    console.error('[error]', error)
  }

  res.status(statusCode).json({ error: true, statusCode, statusMessage: message, message, ...(code ? { code } : {}) })
}
