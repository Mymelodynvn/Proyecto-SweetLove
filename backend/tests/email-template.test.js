// Pruebas de la plantilla de los correos (sin red ni base de datos)
import { describe, test } from 'node:test'
import assert from 'node:assert/strict'

// Las variables se fijan antes de cargar el código para que la configuración las lea
process.env.FRONTEND_URL = 'https://tienda.example.com'
process.env.EMAIL_LOGO_URL = ''

const { renderEmail } = await import('../src/services/emailTemplate.js')

const base = {
  name: 'Ana',
  title: 'Restablece tu contraseña',
  intro: 'Recibimos una solicitud para restablecer tu contraseña. El enlace dura 1 hora.',
  buttonText: 'Elegir nueva contraseña',
  link: 'https://tienda.example.com/tienda/restablecer.html?token=abc123',
}

describe('plantilla de los correos', () => {
  test('el asunto es el título y el HTML lleva el logo, el saludo, el botón y el enlace', () => {
    const email = renderEmail(base)

    assert.equal(email.subject, 'Restablece tu contraseña')
    assert.match(email.html, /<html lang="es">/)
    assert.match(email.html, /<img src="https:\/\/tienda\.example\.com\/tienda\/assets\/recursos\/logo-email\.png"[^>]*alt="Sweet Love"/)
    assert.match(email.html, /Hola <strong>Ana<\/strong>,/)
    assert.match(email.html, /<h1[^>]*>Restablece tu contraseña<\/h1>/)
    // El enlace sale dos veces: en el botón y en el texto de respaldo
    assert.equal(email.html.split('href="https://tienda.example.com/tienda/restablecer.html?token=abc123"').length - 1, 2)
    assert.match(email.html, />Elegir nueva contraseña<\/a>/)
  })

  test('la versión en texto trae el enlace de la acción como primera dirección (de ahí se saca el token)', () => {
    const { text } = renderEmail(base)

    assert.match(text, /^Hola Ana,/)
    assert.equal(text.match(/https?:\/\/\S+/)[0], base.link)
    assert.ok(!text.includes('logo-email.png'), 'el logo solo va en el HTML')
  })

  test('escapa el contenido que viene de personas para que no se pueda inyectar HTML', () => {
    const email = renderEmail({
      ...base,
      name: '<script>alert(1)</script>',
      intro: 'Dice "hola" & <b>adiós</b>',
      link: 'https://tienda.example.com/a?x=1&y="2"',
    })

    assert.ok(!email.html.includes('<script>'), 'el nombre no puede abrir una etiqueta')
    assert.ok(!email.html.includes('<b>adiós</b>'))
    assert.match(email.html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/)
    assert.match(email.html, /href="https:\/\/tienda\.example\.com\/a\?x=1&amp;y=&quot;2&quot;"/)
    // El texto plano no es HTML: se conserva tal cual
    assert.match(email.text, /Hola <script>alert\(1\)<\/script>,/)
  })

  test('sin nombre saluda sin dejar un hueco', () => {
    const email = renderEmail({ ...base, name: '' })

    assert.match(email.html, /<p[^>]*>Hola,<\/p>/)
    assert.match(email.text, /^Hola,\n/)
  })

  test('es una tabla con estilos en línea (lo que entienden Gmail y Outlook): sin hojas de estilo ni scripts', () => {
    const { html } = renderEmail(base)

    assert.match(html, /<table role="presentation"/)
    assert.ok(!/<link\b/i.test(html), 'sin hojas de estilo externas')
    assert.ok(!/<style\b/i.test(html), 'sin bloque <style>')
    assert.ok(!/<script\b/i.test(html), 'sin scripts')
  })
})
