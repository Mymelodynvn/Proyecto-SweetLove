// Utilidades de la sesión: la huella de la contraseña con la que se inició
import { createHash } from 'node:crypto'

// Huella corta de la contraseña guardada (su hash); la sesión la lleva y deja de valer cuando la contraseña cambia, recibe passwordHash
export const passwordStamp = (passwordHash) => createHash('sha256').update(String(passwordHash)).digest('hex').slice(0, 16)
