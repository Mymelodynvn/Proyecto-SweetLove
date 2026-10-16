// Pruebas del envío de correo por la API de Gmail (OAuth + HTTPS) con las llamadas a Google simuladas
import { describe, test, beforeEach, afterEach, mock } from 'node:test'
import assert from 'node:assert/strict'

// Las variables se fijan antes de cargar el código para que la configuración las lea
process.env.SMTP_USER = ''
process.env.SMTP_PASSWORD = ''
process.env.RESEND_API_KEY = ''
process.env.MAIL_TRANSPORT = ''
process.env.MAIL_FROM = ''
process.env.MAIL_RELAY_URL = ''
process.env.MAIL_RELAY_SECRET = ''
process.env.GMAIL_CLIENT_ID = 'cliente-prueba.apps.googleusercontent.com'
process.env.GMAIL_CLIENT_SECRET = 'secreto-prueba'
process.env.GMAIL_REFRESH_TOKEN = 'refresh-prueba'
process.env.GMAIL_USER = ' tienda.prueba@gmail.com '

const { config } = await import('../src/config/env.js')
const mailer = await import('../src/services/mailer.js')

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const SEND_URL = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send'
const mail = { to: 'cliente@example.com', subject: 'Verifica tu correo', text: 'Hola, confirma tu cuenta.', html: '<p>Hola, confirma tu cuenta.</p>' }

// Responde con JSON y el estado indicado, recibe body y status
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

const originalFetch = globalThis.fetch
let calls
let tokenResponse
let sendResponse

// Cambia fetch por una versión que anota cada llamada y responde lo que defina cada prueba
beforeEach(() => {
  calls = []
  tokenResponse = () => json({ access_token: 'token-1', expires_in: 3600 })
  sendResponse = () => json({ id: 'abc' })
  mock.method(console, 'error', () => {})
  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), options })
    return String(url) === TOKEN_URL ? tokenResponse() : sendResponse()
  }
})

afterEach(() => {
  globalThis.fetch = originalFetch
  mock.restoreAll()
})

describe('correo por la API de Gmail', () => {
  test('con las tres credenciales el correo queda activado y el remitente es la cuenta', () => {
    assert.equal(mailer.isEnabled(), true)
    assert.equal(config.mail.from, 'Sweet Love <tienda.prueba@gmail.com>')
  })

  test('pide el token con el refresh token y envía el mensaje completo en base64', async () => {
    await mailer.sendMail(mail)

    assert.equal(calls.length, 2)
    assert.equal(calls[0].url, TOKEN_URL)
    const tokenBody = new URLSearchParams(String(calls[0].options.body))
    assert.equal(tokenBody.get('grant_type'), 'refresh_token')
    assert.equal(tokenBody.get('refresh_token'), 'refresh-prueba')
    assert.equal(tokenBody.get('client_id'), 'cliente-prueba.apps.googleusercontent.com')

    assert.equal(calls[1].url, SEND_URL)
    assert.equal(calls[1].options.headers.Authorization, 'Bearer token-1')
    const raw = Buffer.from(JSON.parse(calls[1].options.body).raw, 'base64url').toString('utf-8')
    assert.match(raw, /^From: Sweet Love <tienda\.prueba@gmail\.com>$/m)
    assert.match(raw, /^To: cliente@example\.com$/m)
    assert.match(raw, /^Subject: Verifica tu correo$/m)
    assert.match(raw, /multipart\/alternative/)
  })

  test('reutiliza el token mientras no venza', async () => {
    await mailer.sendMail(mail)
    await mailer.sendMail(mail)

    assert.equal(calls.filter((call) => call.url === TOKEN_URL).length, 0)
    assert.equal(calls.filter((call) => call.url === SEND_URL).length, 2)
  })

  test('si Gmail responde 401 falla con 502 y el siguiente envío pide un token nuevo', async () => {
    sendResponse = () => json({ error: { code: 401, message: 'Invalid Credentials' } }, 401)
    await assert.rejects(() => mailer.sendMail(mail), { statusCode: 502, message: 'No se pudo enviar el correo.' })

    sendResponse = () => json({ id: 'abc' })
    tokenResponse = () => json({ access_token: 'token-2', expires_in: 3600 })
    calls.length = 0
    await mailer.sendMail(mail)

    assert.equal(calls[0].url, TOKEN_URL)
    assert.equal(calls[1].options.headers.Authorization, 'Bearer token-2')
  })

  test('si Google rechaza el refresh token falla con 502 y no intenta enviar', async () => {
    // Descarta el token guardado con una respuesta 401 para obligar a pedir otro
    sendResponse = () => json({}, 401)
    await assert.rejects(() => mailer.sendMail(mail), { statusCode: 502 })
    calls.length = 0

    tokenResponse = () => json({ error: 'invalid_grant', error_description: 'Token has been expired or revoked.' }, 400)
    sendResponse = () => json({ id: 'abc' })
    await assert.rejects(() => mailer.sendMail(mail), { statusCode: 502, message: 'No se pudo enviar el correo.' })

    assert.equal(calls.filter((call) => call.url === SEND_URL).length, 0)
  })

  test('un error de red también se informa como 502', async () => {
    globalThis.fetch = async () => {
      throw new TypeError('fetch failed')
    }
    await assert.rejects(() => mailer.sendMail(mail), { statusCode: 502, message: 'No se pudo enviar el correo.' })
  })
})
