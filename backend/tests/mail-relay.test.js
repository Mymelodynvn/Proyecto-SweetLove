// Pruebas del envío de correo por el puente de Google Apps Script, con las llamadas a Google simuladas
import { describe, test, beforeEach, afterEach, mock } from 'node:test'
import assert from 'node:assert/strict'

// Las variables se fijan antes de cargar el código para que la configuración las lea
process.env.SMTP_USER = ''
process.env.SMTP_PASSWORD = ''
process.env.RESEND_API_KEY = ''
process.env.MAIL_TRANSPORT = ''
process.env.MAIL_FROM = ''
process.env.MAIL_RELAY_URL = ' https://script.google.com/macros/s/AKfycbPRUEBA/exec '
process.env.MAIL_RELAY_SECRET = 'clave-de-prueba'
// Con el puente configurado, las credenciales de la API de Gmail no deben usarse
process.env.GMAIL_CLIENT_ID = 'cliente-prueba'
process.env.GMAIL_CLIENT_SECRET = 'secreto-prueba'
process.env.GMAIL_REFRESH_TOKEN = 'refresh-prueba'

const mailer = await import('../src/services/mailer.js')

const RELAY_URL = 'https://script.google.com/macros/s/AKfycbPRUEBA/exec'
const mail = { to: 'cliente@example.com', subject: 'Restablece tu contraseña', text: 'Hola, usa este enlace.', html: '<p>Hola, usa este enlace.</p>' }

// Responde con JSON y el estado indicado, recibe body y status
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

const originalFetch = globalThis.fetch
let calls
let relayResponse

// Cambia fetch por una versión que anota cada llamada y responde lo que defina cada prueba
beforeEach(() => {
  calls = []
  relayResponse = () => json({ ok: true })
  mock.method(console, 'error', () => {})
  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), options })
    return relayResponse()
  }
})

afterEach(() => {
  globalThis.fetch = originalFetch
  mock.restoreAll()
})

describe('correo por el puente de Apps Script', () => {
  test('con dirección https y clave el correo queda activado', () => {
    assert.equal(mailer.isEnabled(), true)
  })

  test('envía un POST al script con la clave y el mensaje, y no usa la API de Gmail', async () => {
    await mailer.sendMail(mail)

    assert.equal(calls.length, 1)
    assert.equal(calls[0].url, RELAY_URL)
    assert.equal(calls[0].options.method, 'POST')
    assert.deepEqual(JSON.parse(calls[0].options.body), { secret: 'clave-de-prueba', ...mail })
  })

  test('si el script responde ok:false (por ejemplo, clave incorrecta) falla con 502', async () => {
    relayResponse = () => json({ ok: false, error: 'unauthorized' })
    await assert.rejects(() => mailer.sendMail(mail), { statusCode: 502, message: 'No se pudo enviar el correo.' })
  })

  test('si Google devuelve una página en lugar de JSON falla con 502', async () => {
    relayResponse = () => new Response('<html><body>Inicia sesión</body></html>', { status: 200 })
    await assert.rejects(() => mailer.sendMail(mail), { statusCode: 502 })
  })

  test('un error de red también se informa como 502', async () => {
    globalThis.fetch = async () => {
      throw new TypeError('fetch failed')
    }
    await assert.rejects(() => mailer.sendMail(mail), { statusCode: 502, message: 'No se pudo enviar el correo.' })
  })
})
