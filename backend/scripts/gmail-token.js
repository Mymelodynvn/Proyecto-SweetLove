// Herramienta para conectar Gmail por OAuth: imprime el enlace de autorización y cambia el código recibido por el refresh token
import { config } from '../src/config/env.js'

const REDIRECT_URI = 'http://localhost:8080'
const SCOPE = 'https://www.googleapis.com/auth/gmail.send'
const { clientId, clientSecret } = config.mail.gmail

// Error esperado de la herramienta: su mensaje se muestra tal cual, sin el detalle técnico
class CliError extends Error {}

// Detiene el programa con un mensaje claro, recibe message
const fail = (message) => {
  throw new CliError(message)
}

// Comprueba que el cliente de Google esté definido en backend/.env
const requireClient = () => {
  if (!clientId || !clientSecret) fail('Primero define GMAIL_CLIENT_ID y GMAIL_CLIENT_SECRET en backend/.env (credencial "Aplicación de escritorio" de Google Cloud).')
}

// Imprime el enlace que se abre en el navegador, con la cuenta de Gmail que enviará los correos, para autorizar el envío
const printUrl = () => {
  requireClient()
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPE,
    access_type: 'offline',
    prompt: 'consent',
  })
  console.log('Abre este enlace en el navegador, con la cuenta de Gmail que enviará los correos, y pulsa Permitir:\n')
  console.log(`https://accounts.google.com/o/oauth2/v2/auth?${params}\n`)
  console.log('El navegador mostrará un error de "no se puede conectar" a localhost:8080: es normal.')
  console.log('Copia el valor de code= de la barra de direcciones (o la dirección completa) y ejecuta:\n')
  console.log('  npm run gmail:token -- "EL_CODIGO_O_LA_DIRECCION"')
}

// Obtiene el código de lo que pegó la persona: puede ser el código solo o la dirección completa del navegador, recibe input
const extractCode = (input) => {
  try {
    const code = new URL(input).searchParams.get('code')
    if (code) return code
  } catch {
    // No era una dirección: se trata como el código solo
  }
  try {
    return decodeURIComponent(input)
  } catch {
    return input
  }
}

// Cambia el código de autorización por el refresh token y lo imprime, recibe input (el código o la dirección)
const exchangeCode = async (input) => {
  requireClient()
  if (!input) fail('Falta el código. Uso: npm run gmail:token -- "EL_CODIGO_O_LA_DIRECCION"')

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: extractCode(input.trim()),
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  })
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    fail(`Google rechazó el código (${data.error ?? response.status}) ${data.error_description ?? ''}\nEl código sirve una sola vez y vence en pocos minutos: genera otro con "npm run gmail:url".`)
  }
  if (!data.refresh_token) {
    fail('Google no entregó el refresh token. Quita el acceso de la aplicación en https://myaccount.google.com/permissions y repite desde "npm run gmail:url".')
  }

  console.log('Listo. Agrega estas variables en backend/.env y en las variables de entorno de Render:\n')
  console.log(`GMAIL_REFRESH_TOKEN=${data.refresh_token}`)
  console.log('GMAIL_USER=<el correo de Gmail con el que autorizaste>')
  console.log('\nEl refresh token es secreto: no lo subas a git.')
}

const [command, argument] = process.argv.slice(2)
try {
  if (command === 'url') printUrl()
  else if (command === 'token') await exchangeCode(argument)
  else fail('Uso: node scripts/gmail-token.js url | token "<código o dirección>"')
} catch (error) {
  if (!(error instanceof CliError)) throw error
  console.error(error.message)
  // Se marca el error sin process.exit para dejar que Node cierre las conexiones abiertas
  process.exitCode = 1
}
