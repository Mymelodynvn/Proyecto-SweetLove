// Puente de correo de Sweet Love (Google Apps Script): recibe un POST del backend y envía el mensaje con la cuenta de Gmail que publica este script.
// Se pega en https://script.google.com y se publica como "Aplicación web" (ver backend/README.md, sección Correo).

// Clave compartida con el backend (MAIL_RELAY_SECRET): cámbiala por una larga e inventada por ti
const CLAVE = 'CAMBIA_ESTA_CLAVE'
// Nombre que verá quien reciba el correo
const NOMBRE_REMITENTE = 'Sweet Love'

// Recibe la petición del backend, comprueba la clave y envía el correo, recibe e (la petición, con el cuerpo en JSON)
function doPost(e) {
  try {
    const datos = JSON.parse(e.postData.contents)
    if (datos.secret !== CLAVE) return responder({ ok: false, error: 'clave incorrecta' })
    if (!datos.to || !datos.subject) return responder({ ok: false, error: 'faltan to o subject' })

    const opciones = { to: datos.to, subject: datos.subject, body: datos.text || '', name: NOMBRE_REMITENTE }
    if (datos.html) opciones.htmlBody = datos.html
    MailApp.sendEmail(opciones)
    return responder({ ok: true })
  } catch (error) {
    return responder({ ok: false, error: String(error) })
  }
}

// Devuelve el resultado como JSON (Apps Script siempre responde 200: el resultado real va en ok y error), recibe resultado
function responder(resultado) {
  return ContentService.createTextOutput(JSON.stringify(resultado)).setMimeType(ContentService.MimeType.JSON)
}

// Se ejecuta a mano, una vez, desde el editor: pide los permisos y envía un correo de prueba a tu propia cuenta
function probarEnvio() {
  const miCorreo = Session.getEffectiveUser().getEmail()
  MailApp.sendEmail(miCorreo, 'Prueba de Sweet Love', 'Si lees esto, el puente de correo funciona.')
}
