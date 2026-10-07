// Pruebas de la API que no necesitan base de datos: comprueban que la seguridad y la validación actúan ANTES de llegar a MySQL
import { after, before, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../src/app.js'

let server
let baseUrl

before(async () => {
  server = createApp().listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(() => server.close())

// Envía una petición JSON a la API de prueba, recibe path, options
const call = (path, { method = 'GET', body, headers = {} } = {}) =>
  fetch(baseUrl + path, {
    method,
    headers: { 'content-type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  })

describe('rutas de administrador sin sesión', () => {
  const protectedRoutes = [
    ['GET', '/api/orders'],
    ['PATCH', '/api/orders/1'],
    ['POST', '/api/products'],
    ['PUT', '/api/products/1'],
    ['DELETE', '/api/products/1'],
    ['GET', '/api/customers'],
    ['GET', '/api/payments'],
    ['GET', '/api/shipments'],
    ['GET', '/api/suppliers'],
    ['GET', '/api/dashboard'],
    ['GET', '/api/reports'],
  ]

  for (const [method, path] of protectedRoutes) {
    test(`${method} ${path} responde 401`, async () => {
      const response = await call(path, { method })
      assert.equal(response.status, 401)
    })
  }
})

describe('autenticación', () => {
  test('/api/auth/me sin sesión devuelve user null', async () => {
    const response = await call('/api/auth/me')
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { user: null })
  })

  test('login sin datos responde 400', async () => {
    const response = await call('/api/auth/login', { method: 'POST', body: {} })
    assert.equal(response.status, 400)
  })

  test('registro rechaza contraseñas cortas', async () => {
    const response = await call('/api/auth/register', {
      method: 'POST',
      body: { fullName: 'Ana Prueba', email: 'ana@example.com', password: '123' },
    })
    assert.equal(response.status, 400)
  })

  test('registro rechaza correos inválidos', async () => {
    const response = await call('/api/auth/register', {
      method: 'POST',
      body: { fullName: 'Ana Prueba', email: 'no-es-correo', password: '12345678' },
    })
    assert.equal(response.status, 400)
  })
})

describe('pedidos públicos: validación', () => {
  test('rechaza un pedido sin productos', async () => {
    const response = await call('/api/orders', { method: 'POST', body: { name: 'Ana', email: 'ana@example.com' } })
    assert.equal(response.status, 400)
  })

  test('rechaza un pedido sin nombre', async () => {
    const response = await call('/api/orders', { method: 'POST', body: { email: 'ana@example.com', items: [{ productId: 1, quantity: 1 }] } })
    assert.equal(response.status, 400)
  })
})

describe('CORS y errores', () => {
  test('no abre CORS a orígenes no autorizados', async () => {
    const response = await call('/api/auth/me', { headers: { origin: 'http://evil.example' } })
    assert.equal(response.headers.get('access-control-allow-origin'), null)
  })

  test('una ruta inexistente responde 404 en JSON', async () => {
    const response = await call('/api/no-existe')
    assert.equal(response.status, 404)
    assert.equal((await response.json()).error, true)
  })
})

describe('límite de intentos de login', () => {
  test('bloquea un correo tras 10 intentos fallidos sin afectar a otros correos', async () => {
    // Sin contraseña el login responde 400 antes de tocar la base, y cuenta como intento fallido
    for (let i = 0; i < 10; i++) {
      const response = await call('/api/auth/login', { method: 'POST', body: { email: 'bloqueado@example.com' } })
      assert.equal(response.status, 400)
    }
    const blocked = await call('/api/auth/login', { method: 'POST', body: { email: 'bloqueado@example.com' } })
    assert.equal(blocked.status, 429)

    const other = await call('/api/auth/login', { method: 'POST', body: { email: 'otro@example.com' } })
    assert.equal(other.status, 400)
  })
})
