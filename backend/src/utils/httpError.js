/**
 * Error HTTP controlado: lleva el código de estado que debe recibir el cliente
 * y un mensaje seguro de mostrar. El manejador de errores lo convierte en JSON.
 */
export class HttpError extends Error {
  /**
   * @param {number} statusCode Código HTTP (400, 401, 404, 409...).
   * @param {string} message Mensaje legible para el usuario.
   */
  constructor(statusCode, message) {
    super(message)
    this.name = 'HttpError'
    this.statusCode = statusCode
  }
}
