// Pruebas de las reglas de contraseña y de correo (sin base de datos)
import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { passwordProblem } from '../src/utils/password.js'
import { parseEmail } from '../src/utils/validate.js'

describe('contraseña', () => {
  test('acepta de 8 a 16 caracteres con letras y números', () => {
    for (const password of ['Clave202', 'Clave2026', 'Abcdefghi1', 'ñandú20262ab', 'CONTRASENA2026x', 'Abcdefghijklmn12']) {
      assert.equal(passwordProblem(password), '', password)
    }
  })

  test('acepta símbolos que no sean < ni >', () => {
    for (const password of ['Clave#2026abc', 'Clave.2026abc', 'Clave-2026abc', 'SweetLove#2026', 'Clave2026abc!', 'Cl@ve2026abc']) {
      assert.equal(passwordProblem(password), '', password)
    }
  })

  test('rechaza los espacios, dentro, al inicio y al final', () => {
    for (const password of ['Clave 2026abc', ' Clave2026abc', 'Clave2026abc ', 'Clave\t2026abc']) {
      assert.equal(passwordProblem(password), 'La contraseña no puede tener espacios.', JSON.stringify(password))
    }
  })

  test('rechaza los caracteres < y >', () => {
    for (const password of ['Clave2026<abc', 'Clave2026>abc', '<script>2026ab']) {
      assert.equal(passwordProblem(password), 'La contraseña no puede tener los caracteres < ni >.', password)
    }
  })

  test('rechaza menos de 8 caracteres', () => {
    for (const password of ['Clave20', 'abc12', 'Ab1']) {
      assert.match(passwordProblem(password), /al menos 8 caracteres/, password)
    }
  })

  test('rechaza más de 16 caracteres', () => {
    for (const password of ['Abcdefghijklmno12', 'Clave2026Clave2026x']) {
      assert.equal(passwordProblem(password), 'La contraseña admite máximo 16 caracteres.', password)
    }
  })

  test('sigue pidiendo una letra y un número, y rechaza claves obvias', () => {
    assert.match(passwordProblem('soloLetrasAqui'), /letra y un número/)
    assert.match(passwordProblem('0123456789'), /común/)
    assert.match(passwordProblem('aaaaaaaaaaa'), /común/)
    assert.match(passwordProblem('Clave2026abc', { email: 'clave2026abc@example.com' }), /correo/)
    assert.match(passwordProblem(`${'x'.repeat(80)}1`), /máximo 16 caracteres/)
  })
})

describe('correo', () => {
  test('acepta un correo normal y lo pasa a minúsculas', () => {
    assert.equal(parseEmail('Ana.Perez@Example.COM'), 'ana.perez@example.com')
  })

  test('rechaza cualquier espacio: dentro, al inicio y al final', () => {
    for (const email of [' ana@example.com', 'ana@example.com ', 'an a@example.com', 'ana@exam ple.com', 'ana@example.com\n']) {
      assert.throws(() => parseEmail(email), { statusCode: 400, message: 'El correo no puede tener espacios.' }, JSON.stringify(email))
    }
  })

  test('rechaza lo que no tiene forma de correo o pasa de 100 caracteres', () => {
    for (const email of ['', 'ana', 'ana@', '@example.com', 'ana@example', undefined, null]) {
      assert.throws(() => parseEmail(email), { statusCode: 400, message: 'El correo electrónico no es válido.' }, String(email))
    }
    assert.throws(() => parseEmail(`${'a'.repeat(95)}@x.com`), { statusCode: 400, message: 'El correo admite máximo 100 caracteres.' })
    assert.equal(parseEmail(`${'a'.repeat(88)}@x.com`).length, 94)
  })
})
