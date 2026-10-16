// Servicio de correo: envía por el puente de Apps Script, la API de Gmail, SMTP o Resend, o guarda en memoria en las pruebas
import nodemailer from 'nodemailer'
import { config } from '../config/env.js'
import { HttpError } from '../utils/httpError.js'

// Correos "enviados" en memoria (solo con MAIL_TRANSPORT=memory, para las pruebas)
export const outbox = []

// Conexión SMTP reutilizable (se crea la primera vez que se envía un correo)
let smtpTransport

// Token de acceso de Gmail con su hora de vencimiento (se renueva con el refresh token)
let gmailToken = { value: '', expiresAt: 0 }

// Arma el mensaje completo (cabeceras y partes de texto y HTML) sin enviarlo, para mandarlo por la API de Gmail
const messageBuilder = nodemailer.createTransport({ streamTransport: true, buffer: true, newline: 'unix' })

// Indica si hay usuario y contraseña SMTP configurados
const hasSmtp = () => Boolean(config.mail.smtp.user && config.mail.smtp.password)

// Indica si hay dirección y clave del puente de Apps Script (la dirección debe ser https para no enviar la clave en claro)
const hasRelay = () => config.mail.relay.url.startsWith('https://') && Boolean(config.mail.relay.secret)

// Indica si están las tres credenciales de la API de Gmail (cliente, secreto y refresh token)
const hasGmailApi = () => {
  const { clientId, clientSecret, refreshToken } = config.mail.gmail
  return Boolean(clientId && clientSecret && refreshToken)
}

// Indica si se puede enviar correo (puente de Apps Script, API de Gmail, SMTP, Resend o el modo de pruebas)
export const isEnabled = () =>
  config.mail.transport === 'memory' || hasRelay() || hasGmailApi() || hasSmtp() || Boolean(config.mail.resendApiKey)

// Devuelve la conexión SMTP, creándola si hace falta
const getSmtpTransport = () => {
  const { host, port, user, password } = config.mail.smtp
  smtpTransport ??= nodemailer.createTransport({
    host,
    port,
    // El puerto 465 usa TLS desde el inicio; el 587 lo negocia después (STARTTLS)
    secure: port === 465,
    auth: { user, pass: password },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  })
  return smtpTransport
}

// Devuelve un token de acceso de Gmail vigente; si venció, pide uno nuevo a Google con el refresh token (dura cerca de una hora)
const getGmailAccessToken = async () => {
  if (gmailToken.value && Date.now() < gmailToken.expiresAt) return gmailToken.value

  const { clientId, clientSecret, refreshToken } = config.mail.gmail
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: 'refresh_token' }),
    signal: AbortSignal.timeout(10000),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data.access_token) {
    // "invalid_grant" suele significar que el refresh token venció o se revocó: hay que generar otro
    console.error('[correo] Google no entregó el token de acceso:', response.status, data.error ?? '', data.error_description ?? '')
    throw new HttpError(502, 'No se pudo enviar el correo.')
  }

  // Se descuenta un minuto para no usar un token a punto de vencer
  gmailToken = { value: data.access_token, expiresAt: Date.now() + (Number(data.expires_in) || 3600) * 1000 - 60000 }
  return gmailToken.value
}

// Envía un correo por la API de Gmail (HTTPS), recibe to, subject, text, html
const sendWithGmailApi = async ({ to, subject, text, html }) => {
  try {
    const { message } = await messageBuilder.sendMail({ from: config.mail.from, to, subject, text, html })
    const accessToken = await getGmailAccessToken()
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      // La API pide el mensaje completo codificado en base64 seguro para URL
      body: JSON.stringify({ raw: message.toString('base64url') }),
      signal: AbortSignal.timeout(10000),
    })
    if (!response.ok) {
      // Con 401 el token ya no sirve: se descarta para pedir otro en el próximo envío
      if (response.status === 401) gmailToken = { value: '', expiresAt: 0 }
      console.error('[correo] Gmail API respondió', response.status, await response.text().catch(() => ''))
      throw new HttpError(502, 'No se pudo enviar el correo.')
    }
  } catch (error) {
    if (error instanceof HttpError) throw error
    console.error('[correo] Gmail API falló:', error.name, error.message)
    throw new HttpError(502, 'No se pudo enviar el correo.')
  }
}

// Envía un correo por el puente de Apps Script (un script de Google que manda el mensaje con tu Gmail), recibe to, subject, text, html
const sendWithRelay = async ({ to, subject, text, html }) => {
  try {
    const { url, secret } = config.mail.relay
    // Apps Script responde con una redirección (302) que fetch sigue sola; no lee cabeceras propias, por eso la clave va en el cuerpo
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, to, subject, text, html }),
      signal: AbortSignal.timeout(20000),
    })
    const raw = await response.text()
    let data = null
    try {
      data = JSON.parse(raw)
    } catch {
      // Si no es JSON, Google devolvió una página (por ejemplo, de inicio de sesión)
    }
    // El script siempre responde 200: el resultado real va en { ok, error }
    if (!response.ok || data?.ok !== true) {
      console.error('[correo] El puente de Apps Script falló:', response.status, data?.error ?? raw.slice(0, 120).replace(/\s+/g, ' '))
      throw new HttpError(502, 'No se pudo enviar el correo.')
    }
  } catch (error) {
    if (error instanceof HttpError) throw error
    console.error('[correo] El puente de Apps Script no respondió:', error.name, error.message)
    throw new HttpError(502, 'No se pudo enviar el correo.')
  }
}

// Envía un correo con asunto, texto y HTML, recibe to, subject, text, html
export const sendMail = async ({ to, subject, text, html }) => {
  if (config.mail.transport === 'memory') {
    outbox.push({ to, subject, text, html })
    return
  }

  if (hasRelay()) {
    await sendWithRelay({ to, subject, text, html })
    return
  }

  if (hasGmailApi()) {
    await sendWithGmailApi({ to, subject, text, html })
    return
  }

  if (hasSmtp()) {
    try {
      await getSmtpTransport().sendMail({ from: config.mail.from, to, subject, text, html })
    } catch (error) {
      // El detalle solo se registra en el servidor (nunca incluye la contraseña)
      console.error('[correo] SMTP falló:', error.code ?? '', error.message)
      throw new HttpError(502, 'No se pudo enviar el correo.')
    }
    return
  }

  if (!config.mail.resendApiKey) throw new HttpError(503, 'El envío de correos no está configurado.')

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.mail.resendApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: config.mail.from, to: [to], subject, text, html }),
    signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) {
    console.error('[correo] Resend respondió', response.status, await response.text().catch(() => ''))
    throw new HttpError(502, 'No se pudo enviar el correo.')
  }
}
