// Plantilla de los correos de la tienda: tarjeta con el logo, un botón y el enlace de respaldo.
// El HTML usa tablas y estilos en línea porque es lo que entienden Gmail, Outlook y los demás clientes de correo.
import { config } from '../config/env.js'

// Colores de la tienda
const COLOR = {
  page: '#FFFDEC',
  header: '#FFE2E2',
  card: '#FFFFFF',
  border: '#F3D9D9',
  title: '#5D7B60',
  text: '#4A5A4C',
  muted: '#8A8A7C',
  button: '#6C8D6F',
  buttonText: '#FFFDEC',
  accent: '#C97B7B',
  divider: '#F0C9C9',
}

// Letra de los correos: la de la tienda si el cliente de correo la tiene, y una común si no
const FONT = "'Montserrat','Segoe UI',Helvetica,Arial,sans-serif"

// Escapa texto para ponerlo dentro de HTML, recibe text
const escapeHtml = (text) =>
  String(text ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])

// Dirección pública del logo: EMAIL_LOGO_URL si se define; si no, el que está en la tienda (el cliente de correo la descarga, por eso debe ser pública)
const logoUrl = () => config.mail.logoUrl || `${config.frontendUrl}/tienda/assets/recursos/logo-email.png`

// Arma el correo completo (asunto, texto y HTML) con el logo, un botón que lleva al enlace y el enlace en texto, recibe name, title, intro, buttonText, link
export const renderEmail = ({ name, title, intro, buttonText, link }) => {
  const safe = { name: escapeHtml(name), title: escapeHtml(title), intro: escapeHtml(intro), buttonText: escapeHtml(buttonText), link: escapeHtml(link) }
  const greeting = safe.name ? `Hola <strong>${safe.name}</strong>,` : 'Hola,'

  const text = [
    name ? `Hola ${name},` : 'Hola,',
    '',
    intro,
    '',
    `${buttonText}: ${link}`,
    '',
    'Si no fuiste tú, ignora este correo: no se hará ningún cambio.',
    '',
    'Sweet Love · Handmade cakes',
  ].join('\n')

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${safe.title}</title>
</head>
<body style="margin:0;padding:0;background:${COLOR.page};">
  <!-- Texto que muestra la bandeja de entrada junto al asunto (no se ve dentro del correo) -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${COLOR.page};font-size:1px;line-height:1px;">${safe.intro}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLOR.page};">
    <tr>
      <td align="center" style="padding:28px 14px;">

        <!-- Tarjeta del correo -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:${COLOR.card};border:1px solid ${COLOR.border};border-radius:24px;overflow:hidden;">

          <!-- Cabecera rosada con el logo -->
          <tr>
            <td align="center" bgcolor="${COLOR.header}" style="background:${COLOR.header};padding:28px 20px 24px;">
              <img src="${escapeHtml(logoUrl())}" width="112" alt="Sweet Love" style="display:block;width:112px;max-width:112px;height:auto;border:0;outline:none;text-decoration:none;">
            </td>
          </tr>

          <!-- Título, saludo y explicación -->
          <tr>
            <td style="padding:34px 36px 8px;font-family:${FONT};color:${COLOR.text};">
              <h1 style="margin:0 0 20px;font-family:${FONT};font-size:24px;line-height:1.3;font-weight:700;color:${COLOR.title};">${safe.title}</h1>
              <p style="margin:0 0 12px;font-size:16px;line-height:1.6;">${greeting}</p>
              <p style="margin:0 0 28px;font-size:16px;line-height:1.6;">${safe.intro}</p>
            </td>
          </tr>

          <!-- Botón -->
          <tr>
            <td align="center" style="padding:0 36px 30px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" bgcolor="${COLOR.button}" style="background:${COLOR.button};border-radius:999px;">
                    <a href="${safe.link}" style="display:inline-block;padding:15px 36px;font-family:${FONT};font-size:16px;font-weight:700;line-height:1.2;color:${COLOR.buttonText};text-decoration:none;border-radius:999px;">${safe.buttonText}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Enlace de respaldo -->
          <tr>
            <td style="padding:0 36px 26px;font-family:${FONT};">
              <p style="margin:0 0 6px;font-size:13px;line-height:1.5;color:${COLOR.muted};">¿No funciona el botón? Copia este enlace en tu navegador:</p>
              <p style="margin:0;font-size:13px;line-height:1.5;word-break:break-all;"><a href="${safe.link}" style="color:${COLOR.accent};text-decoration:underline;">${safe.link}</a></p>
            </td>
          </tr>

          <!-- Línea y aviso de seguridad -->
          <tr>
            <td style="padding:0 36px 32px;">
              <div style="border-top:1px dashed ${COLOR.divider};padding-top:18px;font-family:${FONT};font-size:13px;line-height:1.5;color:${COLOR.muted};">Si no fuiste tú, ignora este correo: no se hará ningún cambio.</div>
            </td>
          </tr>

          <!-- Pie verde con la marca -->
          <tr>
            <td align="center" bgcolor="${COLOR.button}" style="background:${COLOR.button};padding:22px 20px;font-family:${FONT};color:${COLOR.buttonText};">
              <div style="font-size:17px;font-weight:700;letter-spacing:0.3px;">Sweet Love</div>
              <div style="margin-top:3px;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Handmade cakes</div>
            </td>
          </tr>
        </table>

        <!-- Nota bajo la tarjeta -->
        <p style="margin:16px 0 0;font-family:${FONT};font-size:12px;line-height:1.5;color:${COLOR.muted};">Recibes este correo porque se pidió con tu dirección en Sweet Love.</p>
      </td>
    </tr>
  </table>
</body>
</html>`

  return { subject: title, text, html }
}
