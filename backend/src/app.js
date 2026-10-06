/**
 * Construye la aplicación Express (sin abrir el puerto), de modo que las
 * pruebas puedan arrancarla en un puerto temporal.
 *
 * Flujo de una petición:
 *   cliente -> CORS -> JSON -> sesión -> rutas (/api) -> controlador -> servicio -> modelo -> MySQL
 */
import express from 'express'
import cors from 'cors'
import cookieSession from 'cookie-session'
import { config } from './config/env.js'
import routes from './routes/index.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import { UPLOADS_ROOT } from './utils/product-image.js'

/**
 * Crea y configura la aplicación Express.
 * @returns {import('express').Express} Aplicación lista para escuchar.
 */
export const createApp = () => {
  const app = express()

  // Render y otros hosts ponen un proxy delante: necesario para cookies `secure`.
  app.set('trust proxy', 1)
  app.disable('x-powered-by')

  // CORS: solo los orígenes de CORS_ORIGIN. Sin ellos, solo mismo origen (el frontend usa proxy).
  app.use(cors({ origin: config.corsOrigins, credentials: true }))

  // Las imágenes de productos llegan en base64, por eso el límite es mayor al habitual.
  app.use(express.json({ limit: '6mb' }))

  // Sesión: cookie firmada, no legible desde JavaScript, válida 8 horas.
  // En producción la cookie lleva el atributo `secure` (solo viaja por HTTPS). Se usa
  // `secureProxy` porque el frontend llega a esta API por HTTP interno, detrás de un
  // proxy que ya terminó el HTTPS; con `secure` la librería rechazaría la cookie.
  app.use(
    cookieSession({
      name: 'sweetlove-session',
      keys: [config.sessionSecret],
      httpOnly: true,
      sameSite: 'lax',
      secureProxy: config.isProduction,
      maxAge: 8 * 60 * 60 * 1000,
    }),
  )

  // Imágenes subidas por el administrador.
  app.use('/uploads', express.static(UPLOADS_ROOT))

  app.use('/api', routes)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
