// Servicio de correo: envía con Resend si hay clave; en pruebas guarda los correos en memoria; si no, está desactivado
import { config } from '../config/env.js'
import { HttpError } from '../utils/httpError.js'

// Correos "enviados" en memoria (solo con MAIL_TRANSPORT=memory, para las pruebas)
export const outbox = []

// Indica si se puede enviar correo (hay clave de Resend o es el modo de pruebas)
export const isEnabled = () => config.mail.transport === 'memory' || Boolean(config.mail.resendApiKey)

// Envía un correo con asunto, texto y HTML, recibe to, subject, text, html
export const sendMail = async ({ to, subject, text, html }) => {
  if (config.mail.transport === 'memory') {
    outbox.push({ to, subject, text, html })
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
    // El detalle solo se registra en el servidor
    console.error('[correo] Resend respondió', response.status, await response.text().catch(() => ''))
    throw new HttpError(502, 'No se pudo enviar el correo.')
  }
}
