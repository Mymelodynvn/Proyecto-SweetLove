import bcrypt from 'bcryptjs'
import { getDatabase } from '../../utils/db'

export default defineEventHandler(async (event) => {
  // Permitir peticiones desde Live Server (CORS)
  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  })

  // Responder de inmediato a las verificaciones de seguridad del navegador
  if (getMethod(event) === 'OPTIONS') {
    return 'OK'
  }

  const body = await readBody(event)
  const fullName = (body.nombre || body.fullName || '').toString().trim()
  const email = (body.email || body.correo || '').toString().trim()
  const password = (body.contrasena || body.password || '').toString().trim()

  if (!fullName || !email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Todos los campos son obligatorios.',
    })
  }

  const parts = fullName.split(' ')
  const nombre = parts[0]
  const apellido = parts.slice(1).join(' ') || ' '

  const database = getDatabase()

  const [existing] = await database.query(
    `SELECT idUser FROM usuario WHERE LOWER(email) = LOWER(?) OR LOWER(correo) = LOWER(?) LIMIT 1`,
    [email, email]
  )

  if ((existing as Array<any>).length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El correo electrónico ya está registrado.',
    })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await database.query(
    `INSERT INTO usuario (nombre, apellido, email, correo, contrasena, idRol) VALUES (?, ?, ?, ?, ?, 2)`,
    [nombre, apellido, email, email, hashedPassword]
  )

  return {
    statusCode: 201,
    message: 'Usuario registrado exitosamente',
  }
})
