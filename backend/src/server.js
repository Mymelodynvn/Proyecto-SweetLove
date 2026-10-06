/**
 * Punto de entrada del backend: abre el puerto HTTP.
 * Uso: `npm start` (producción) o `npm run dev` (reinicia al guardar).
 */
import { createApp } from './app.js'
import { config } from './config/env.js'

createApp().listen(config.port, () => {
  console.log(`Sweet Love API escuchando en http://localhost:${config.port}`)
})
