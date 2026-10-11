// Error HTTP controlado: lleva el código de estado que debe recibir el cliente y un mensaje seguro de mostrar
export class HttpError extends Error {
  // constructor, recibe statusCode (código HTTP: 400, 401, 404...), message (texto para el usuario) y code (clave opcional que la interfaz puede reconocer)
  constructor(statusCode, message, code) {
    super(message)
    this.name = 'HttpError'
    this.statusCode = statusCode
    this.code = code
  }
}
