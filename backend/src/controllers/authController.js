// Controlador de autenticación: registro, inicio/cierre de sesión, verificación de correo y contraseñas
import bcrypt from 'bcryptjs'
import { HttpError } from '../utils/httpError.js'
import { cleanText, parseEmail, parseName } from '../utils/validate.js'
import * as userModel from '../models/userModel.js'
import * as accountService from '../services/accountService.js'

// Hash de relleno: se compara aunque el correo no exista para no revelar, por tiempo de respuesta, qué correos están registrados
const DUMMY_HASH = bcrypt.hashSync('sweetlove-dummy', 10)

// Reduce un registro de usuario a los datos que se pueden enviar al navegador, recibe user
const toPublicUser = (user) => ({
  idUser: user.idUser,
  nombre: user.nombre,
  apellido: user.apellido,
  email: user.email,
  idRol: user.idRol,
})

// POST /api/auth/register — crea una cuenta de cliente; con correo configurado queda pendiente de verificar, recibe req, res
export const register = async (req, res) => {
  const fullName = parseName(req.body?.fullName ?? req.body?.nombre, 'El nombre', 100)
  const email = parseEmail(req.body?.email ?? req.body?.correo)
  const password = String(req.body?.password ?? req.body?.contrasena ?? '')

  res.status(201).json(await accountService.registerCustomer({ fullName, email, password }))
}

// POST /api/auth/login — valida credenciales y abre la sesión, recibe req, res
export const login = async (req, res) => {
  const email = cleanText(req.body?.email ?? req.body?.correo).toLowerCase()
  const password = String(req.body?.password ?? req.body?.contrasena ?? '')

  if (!email || !password) throw new HttpError(400, 'Correo y contraseña son obligatorios')

  const user = await userModel.findByEmail(email)
  const storedHash = user?.contrasena?.startsWith('$2') ? user.contrasena : DUMMY_HASH
  const passwordMatches = await bcrypt.compare(password, storedHash)

  if (!user || !passwordMatches) throw new HttpError(401, 'Correo o contraseña incorrectos.')
  // Con las credenciales correctas se avisa si falta verificar el correo (la cuenta existe, así que no se revela nada nuevo)
  if (!user.emailVerificado) throw new HttpError(403, 'Debes verificar tu correo antes de iniciar sesión.', 'EMAIL_NOT_VERIFIED')

  req.session = { idUser: user.idUser, idRol: user.idRol }
  res.json({ message: 'Inicio de sesión exitoso', user: toPublicUser(user) })
}

// POST /api/auth/logout — cierra la sesión eliminando la cookie, recibe req, res
export const logout = (req, res) => {
  req.session = null
  res.json({ ok: true })
}

// GET /api/auth/me — devuelve el usuario de la sesión actual, o `{ user: null }` si no hay sesión, recibe req, res
export const me = async (req, res) => {
  if (!req.session?.idUser) return void res.json({ user: null })

  const user = await userModel.findById(req.session.idUser)
  res.json({ user: user ? toPublicUser(user) : null })
}

// POST /api/auth/forgot-password — envía el enlace para restablecer la contraseña (responde igual exista o no la cuenta), recibe req, res
export const forgotPassword = async (req, res) => {
  await accountService.requestPasswordReset(parseEmail(req.body?.email))
  res.json({ message: accountService.GENERIC_RESET_MESSAGE })
}

// POST /api/auth/reset-password — fija una contraseña nueva con el token del enlace, recibe req, res
export const resetPassword = async (req, res) => {
  const token = cleanText(req.body?.token)
  if (!token) throw new HttpError(400, 'El enlace no es válido o ya venció.', 'INVALID_TOKEN')

  await accountService.resetPassword(token, String(req.body?.password ?? ''))
  res.json({ message: 'Tu contraseña se actualizó. Ya puedes iniciar sesión.' })
}

// POST /api/auth/verify-email — verifica el correo con el token del enlace, recibe req, res
export const verifyEmail = async (req, res) => {
  const token = cleanText(req.body?.token)
  if (!token) throw new HttpError(400, 'El enlace no es válido o ya venció.', 'INVALID_TOKEN')

  await accountService.verifyEmail(token)
  res.json({ message: 'Tu correo quedó verificado. Ya puedes iniciar sesión.' })
}

// POST /api/auth/resend-verification — reenvía el correo de verificación (responde igual exista o no la cuenta), recibe req, res
export const resendVerification = async (req, res) => {
  await accountService.resendVerification(parseEmail(req.body?.email))
  res.json({ message: 'Si la cuenta está pendiente de verificar, te enviamos un nuevo correo.' })
}

// POST /api/auth/change-password — cambia la contraseña de la cuenta con sesión, pidiendo la actual, recibe req, res
export const changePassword = async (req, res) => {
  await accountService.changePassword(req.session.idUser, req.body?.currentPassword, String(req.body?.newPassword ?? ''))
  res.json({ message: 'Tu contraseña se actualizó.' })
}
