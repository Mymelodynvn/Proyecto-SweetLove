// Servicio de cuentas: registro, verificación de correo, recuperación y cambio de contraseña
import { createHash, randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { config } from '../config/env.js'
import { HttpError } from '../utils/httpError.js'
import { assertStrongPassword } from '../utils/password.js'
import { passwordStamp } from '../utils/session.js'
import { ADMIN_ROLE_ID } from '../middleware/auth.js'
import * as userModel from '../models/userModel.js'
import * as tokenModel from '../models/tokenModel.js'
import * as mailer from './mailer.js'
import { renderEmail } from './emailTemplate.js'

// Tipos de token y su vigencia en minutos
const RESET = 'reset'
const VERIFY = 'verificacion'
const RESET_MINUTES = 60
const VERIFY_MINUTES = 24 * 60
// Máximo de correos del mismo tipo que se envían a una cuenta por hora
const MAX_EMAILS_PER_HOUR = 3
// Largo de las columnas usuario.nombre y usuario.apellido (ver database/schema.sql)
const MAX_NAME_PART_LENGTH = 50

// Mensaje que se responde siempre, exista o no la cuenta, para no revelar qué correos están registrados
export const GENERIC_RESET_MESSAGE = 'Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña.'
// Mensaje cuando el registro queda pendiente de activar por correo
export const PENDING_MESSAGE = 'Te enviamos un correo para activar tu cuenta. Revisa tu bandeja de entrada.'

// Calcula el hash (SHA-256) de un token; en la base solo se guarda el hash, recibe token
const hashToken = (token) => createHash('sha256').update(String(token)).digest('hex')

// Crea un token nuevo para un usuario y devuelve el texto que va en el enlace, recibe user, tipo, minutes
const issueToken = async (user, tipo, minutes) => {
  const token = randomBytes(32).toString('base64url')
  await tokenModel.create({ idUser: user.idUser, tipo, tokenHash: hashToken(token), minutes })
  return token
}

// Envía a un usuario el enlace para fijar su contraseña (restablecer o activar cuenta); los administradores usan la pantalla del panel, recibe user, activation
const sendResetLink = async (user, activation = false) => {
  if ((await tokenModel.countRecent(user.idUser, RESET, 60)) >= MAX_EMAILS_PER_HOUR) return
  const token = await issueToken(user, RESET, RESET_MINUTES)
  const path = user.idRol === ADMIN_ROLE_ID ? '/auth/reset-password' : '/tienda/restablecer.html'
  const link = `${config.frontendUrl}${path}?token=${token}`
  const email = renderEmail({
    name: user.nombre,
    title: activation ? 'Activa tu cuenta de Sweet Love' : 'Restablece tu contraseña',
    intro: activation
      ? 'Para activar tu cuenta elige tu contraseña con el siguiente botón. El enlace dura 1 hora.'
      : 'Recibimos una solicitud para restablecer tu contraseña. El enlace dura 1 hora.',
    buttonText: activation ? 'Activar mi cuenta' : 'Elegir nueva contraseña',
    link,
  })
  await mailer.sendMail({ to: user.email, ...email })
}

// Envía a un usuario el enlace para verificar su correo, recibe user
const sendVerificationLink = async (user) => {
  if ((await tokenModel.countRecent(user.idUser, VERIFY, 60)) >= MAX_EMAILS_PER_HOUR) return
  const token = await issueToken(user, VERIFY, VERIFY_MINUTES)
  const email = renderEmail({
    name: user.nombre,
    title: 'Verifica tu correo en Sweet Love',
    intro: 'Confirma que este correo es tuyo para poder iniciar sesión. El enlace dura 24 horas.',
    buttonText: 'Verificar mi correo',
    link: `${config.frontendUrl}/tienda/verificar.html?token=${token}`,
  })
  await mailer.sendMail({ to: user.email, ...email })
}

// Ejecuta un envío de correo sin que un fallo rompa la respuesta (queda registrado en el servidor), recibe task
const safely = async (task) => {
  try {
    await task()
  } catch (error) {
    console.error('[cuentas] no se pudo enviar el correo:', error.message)
  }
}

// Separa el nombre completo en nombre (el primer término) y apellido (el resto, vacío si no hay) y comprueba que quepan, recibe fullName
const splitFullName = (fullName) => {
  const [nombre, ...rest] = fullName.split(/\s+/)
  const apellido = rest.join(' ')
  if (nombre.length > MAX_NAME_PART_LENGTH) throw new HttpError(400, `El nombre admite máximo ${MAX_NAME_PART_LENGTH} caracteres.`)
  if (apellido.length > MAX_NAME_PART_LENGTH) throw new HttpError(400, `El apellido admite máximo ${MAX_NAME_PART_LENGTH} caracteres.`)
  return { nombre, apellido }
}

// Registra una cuenta de cliente; con correo configurado queda pendiente de verificar, recibe fullName, email, password
export const registerCustomer = async ({ fullName, email, password }) => {
  const { nombre, apellido } = splitFullName(fullName)
  assertStrongPassword(password, { email, name: fullName })
  const existing = await userModel.findByEmail(email)

  // Cuenta creada al comprar como invitado: solo quien reciba el correo puede elegir la contraseña y quedarse con ella
  if (existing?.esInvitado) {
    if (!mailer.isEnabled()) throw new HttpError(409, 'El correo electrónico ya está registrado.')
    await safely(() => sendResetLink(existing, true))
    return { message: PENDING_MESSAGE, needsVerification: true }
  }
  if (existing) throw new HttpError(409, 'El correo electrónico ya está registrado.')

  const needsVerification = mailer.isEnabled()
  const idUser = await userModel.create({
    nombre,
    apellido,
    email,
    contrasenaHash: await bcrypt.hash(password, 10),
    rol: 'Cliente',
    emailVerificado: !needsVerification,
  })

  if (!needsVerification) return { message: 'Usuario registrado exitosamente', needsVerification: false }
  await safely(() => sendVerificationLink({ idUser, nombre, email }))
  return { message: PENDING_MESSAGE, needsVerification: true }
}

// Verifica el correo de una cuenta con el token del enlace, recibe token
export const verifyEmail = async (token) => {
  const found = await tokenModel.findValid(VERIFY, hashToken(token))
  if (!found || !(await tokenModel.consume(found.idToken))) throw new HttpError(400, 'El enlace no es válido o ya venció.', 'INVALID_TOKEN')
  await userModel.markEmailVerified(found.idUser)
}

// Vuelve a enviar el correo de verificación a una cuenta sin verificar (responde igual exista o no), recibe email
export const resendVerification = async (email) => {
  if (!mailer.isEnabled()) throw new HttpError(503, 'El envío de correos no está configurado.')
  const user = await userModel.findByEmail(email)
  if (user && !user.emailVerificado && !user.esInvitado) await safely(() => sendVerificationLink(user))
}

// Envía el enlace para restablecer la contraseña (responde igual exista o no la cuenta), recibe email
export const requestPasswordReset = async (email) => {
  if (!mailer.isEnabled()) throw new HttpError(503, 'El envío de correos no está configurado.')
  const user = await userModel.findByEmail(email)
  if (user) await safely(() => sendResetLink(user, Boolean(user.esInvitado)))
}

// Fija una contraseña nueva con el token del enlace; deja la cuenta activa y verificada y devuelve el correo de la cuenta, recibe token, password
export const resetPassword = async (token, password) => {
  const found = await tokenModel.findValid(RESET, hashToken(token))
  if (!found) throw new HttpError(400, 'El enlace no es válido o ya venció.', 'INVALID_TOKEN')

  // Una contraseña débil se rechaza antes de gastar el token, para que se pueda volver a intentar
  assertStrongPassword(password, { email: found.email, name: found.nombre })
  if (!(await tokenModel.consume(found.idToken))) throw new HttpError(400, 'El enlace no es válido o ya venció.', 'INVALID_TOKEN')

  await userModel.activateWithPassword(found.idUser, await bcrypt.hash(password, 10))
  await tokenModel.invalidateAll(found.idUser, RESET)
  return { email: found.email }
}

// Cambia la contraseña de una cuenta con sesión iniciada, pidiendo la actual; devuelve la huella nueva de la sesión, recibe idUser, currentPassword, newPassword
export const changePassword = async (idUser, currentPassword, newPassword) => {
  const user = await userModel.findByIdWithPassword(idUser)
  if (!user) throw new HttpError(401, 'Debes iniciar sesión.')

  if (!(await bcrypt.compare(String(currentPassword ?? ''), user.contrasena))) {
    throw new HttpError(400, 'La contraseña actual no es correcta.', 'WRONG_PASSWORD')
  }
  if (newPassword === currentPassword) throw new HttpError(400, 'La contraseña nueva debe ser distinta de la actual.')
  assertStrongPassword(newPassword, { email: user.email, name: user.nombre })

  const newHash = await bcrypt.hash(newPassword, 10)
  await userModel.setPassword(idUser, newHash)
  await tokenModel.invalidateAll(idUser, RESET)
  return { stamp: passwordStamp(newHash) }
}
