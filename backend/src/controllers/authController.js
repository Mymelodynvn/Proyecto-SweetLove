// Controlador de autenticación: registro, inicio/cierre de sesión y usuario actual
import bcrypt from 'bcryptjs'
import { HttpError } from '../utils/httpError.js'
import { cleanText, parseEmail } from '../utils/validate.js'
import * as userModel from '../models/userModel.js'

// Largo mínimo de contraseña aceptado al registrarse
const MIN_PASSWORD_LENGTH = 8

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

// POST /api/auth/register — crea una cuenta de cliente, recibe req, res
export const register = async (req, res) => {
  const fullName = cleanText(req.body?.fullName ?? req.body?.nombre)
  const email = parseEmail(req.body?.email ?? req.body?.correo)
  const password = String(req.body?.password ?? req.body?.contrasena ?? '')

  if (!fullName) throw new HttpError(400, 'Todos los campos son obligatorios.')
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new HttpError(400, `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`)
  }
  if (await userModel.findByEmail(email)) throw new HttpError(409, 'El correo electrónico ya está registrado.')

  // El primer término es el nombre; el resto, el apellido.
  const [nombre, ...rest] = fullName.split(/\s+/)
  await userModel.create({
    nombre,
    apellido: rest.join(' ') || ' ',
    email,
    contrasenaHash: await bcrypt.hash(password, 10),
    rol: 'Cliente',
  })

  res.status(201).json({ message: 'Usuario registrado exitosamente' })
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
