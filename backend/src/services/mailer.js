// Servicio de correo: envía por SMTP (Gmail) si está configurado, por Resend si hay clave, o guarda en memoria en las pruebas
import nodemailer from 'nodemailer'
import { config } from '../config/env.js'
import { HttpError } from '../utils/httpError.js'

// Correos "enviados" en memoria (solo con MAIL_TRANSPORT=memory, para las pruebas)
export const outbox = []

// Conexión SMTP reutilizable (se crea la primera vez que se envía un correo)
let smtpTransport

// Indica si hay usuario y contraseña SMTP configurados
const hasSmtp = () => Boolean(config.mail.smtp.user && config.mail.smtp.password)

// Indica si se puede enviar correo (SMTP, Resend o el modo de pruebas)
export const isEnabled = () => config.mail.transport === 'memory' || hasSmtp() || Boolean(config.mail.resendApiKey)

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

// Envía un correo con asunto, texto y HTML, recibe to, subject, text, html
export const sendMail = async ({ to, subject, text, html }) => {
  if (config.mail.transport === 'memory') {
    outbox.push({ to, subject, text, html })
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
