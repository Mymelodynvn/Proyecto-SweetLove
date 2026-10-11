// Pruebas de la configuración del correo (SMTP/Gmail) sin enviar nada
import { describe, test } from 'node:test'
import assert from 'node:assert/strict'

// Las variables se fijan antes de cargar el código para que la configuración las lea
process.env.SMTP_USER = ' cuenta.prueba@gmail.com '
process.env.SMTP_PASSWORD = 'abcd efgh ijkl mnop'
process.env.SMTP_HOST = ''
process.env.SMTP_PORT = ''
process.env.MAIL_FROM = ''
process.env.MAIL_TRANSPORT = ''
process.env.RESEND_API_KEY = ''

const { config } = await import('../src/config/env.js')
const mailer = await import('../src/services/mailer.js')

describe('correo por SMTP (Gmail)', () => {
  test('usa Gmail por defecto y limpia los espacios de la contraseña de aplicación', () => {
    assert.equal(config.mail.smtp.host, 'smtp.gmail.com')
    assert.equal(config.mail.smtp.port, 465)
    assert.equal(config.mail.smtp.user, 'cuenta.prueba@gmail.com')
    assert.equal(config.mail.smtp.password, 'abcdefghijklmnop')
  })

  test('el remitente por defecto es la propia cuenta (Gmail no permite otro)', () => {
    assert.equal(config.mail.from, 'Sweet Love <cuenta.prueba@gmail.com>')
  })

  test('con usuario y contraseña SMTP el correo queda activado', () => {
    assert.equal(mailer.isEnabled(), true)
  })
})
