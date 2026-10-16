// Pruebas de integración con una base MySQL real: cuentas, contraseñas, pedidos, stock y pagos (Mercado Pago simulado)
// Solo corren si se define TEST_DATABASE_NAME (el nombre debe terminar en _test, p. ej. sweetlove_test); la base se recrea al empezar
import { after, before, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHmac } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const TEST_DB = process.env.TEST_DATABASE_NAME
const enabled = Boolean(TEST_DB)
if (enabled && !/_test$/.test(TEST_DB)) throw new Error('TEST_DATABASE_NAME debe terminar en _test para no tocar una base real.')

// Las variables se fijan antes de cargar el código para que la configuración las lea
if (enabled) {
  process.env.DATABASE_NAME = TEST_DB
  process.env.MAIL_TRANSPORT = 'memory'
  process.env.MP_ACCESS_TOKEN = 'APP_USR-token-de-prueba'
  process.env.MP_WEBHOOK_SECRET = 'secreto-de-prueba'
  process.env.MP_CURRENCY_ID = 'COP'
  process.env.FRONTEND_URL = 'https://tienda.example.com'
  process.env.BACKEND_PUBLIC_URL = ''
  process.env.ORDER_TTL_MINUTES = '30'
}

const realFetch = globalThis.fetch
let api
let getPool
let outbox
let paymentService
let orderToken
let server
let baseUrl
let adminCookie
let counter = 0

// Datos de Mercado Pago simulados: pagos por pedido y la última preferencia creada
const mp = { payments: new Map(), lastPreference: null, failSearch: false }

// Simula la API de Mercado Pago; cualquier otra dirección usa la red real, recibe url, options
const fakeFetch = async (url, options) => {
  const target = String(url)
  if (!target.startsWith('https://api.mercadopago.com')) return realFetch(url, options)

  // Arma una respuesta simulada con estado y cuerpo, recibe status, data
  const reply = (status, data) => ({ ok: status >= 200 && status < 300, status, json: async () => data })
  if (target.includes('/checkout/preferences')) {
    mp.lastPreference = JSON.parse(options.body)
    return reply(201, { id: 'pref-test', init_point: 'https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=pref-test' })
  }
  if (target.includes('/v1/payments/search')) {
    if (mp.failSearch) return reply(500, { message: 'error simulado' })
    const orderId = new URL(target).searchParams.get('external_reference')
    return reply(200, { results: mp.payments.get(orderId) ?? [] })
  }
  const paymentId = target.split('/v1/payments/')[1]
  for (const list of mp.payments.values()) {
    const found = list.find((payment) => String(payment.id) === paymentId)
    if (found) return reply(200, found)
  }
  return reply(404, { message: 'Payment not found' })
}

// Envía una petición JSON a la API de prueba y devuelve estado, cuerpo y cookies, recibe path, options
const call = async (path, { method = 'GET', body, cookie, headers = {} } = {}) => {
  const response = await realFetch(baseUrl + path, {
    method,
    headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}), ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = await response.json().catch(() => ({}))
  const cookies = (response.headers.getSetCookie?.() ?? []).map((line) => line.split(';')[0]).join('; ')
  return { status: response.status, data, cookie: cookies, headers: response.headers }
}

// Inicia sesión y devuelve la cookie, recibe email, password
const login = async (email, password) => {
  const result = await call('/api/auth/login', { method: 'POST', body: { email, password } })
  assert.equal(result.status, 200, `login de ${email}: ${JSON.stringify(result.data)}`)
  return result.cookie
}

// Genera un correo único para cada prueba
const uniqueEmail = (prefix = 'cliente') => `${prefix}${Date.now()}${++counter}@example.com`

// Registra una cuenta, verifica el correo con el enlace recibido y devuelve sus datos, recibe password
const createVerifiedUser = async (password = 'ClaveSegura1') => {
  const email = uniqueEmail()
  const registered = await call('/api/auth/register', { method: 'POST', body: { fullName: 'Ana Prueba', email, password } })
  assert.equal(registered.status, 201)
  await call('/api/auth/verify-email', { method: 'POST', body: { token: tokenFromLastMail(email) } })
  return { email, password }
}

// Saca el token del último correo enviado a una dirección, recibe email
const tokenFromLastMail = (email) => {
  const mail = [...outbox].reverse().find((item) => item.to === email)
  assert.ok(mail, `no hay correo para ${email}`)
  return new URL(mail.text.match(/https?:\/\/\S+/)[0]).searchParams.get('token')
}

// Crea un producto como administrador y devuelve su identificador, recibe stock, price
const createProduct = async (stock, price = 10000) => {
  const created = await call('/api/products', {
    method: 'POST',
    cookie: adminCookie,
    body: { name: `Producto ${++counter}`, description: 'prueba', price, stock, active: true },
  })
  assert.equal(created.status, 201, JSON.stringify(created.data))
  return created.data.producto.id
}

// Devuelve el stock actual de un producto, recibe productId
const stockOf = async (productId) => {
  const [rows] = await getPool().query('SELECT cantidad FROM producto WHERE idProducto = ?', [productId])
  return Number(rows[0].cantidad)
}

// Datos de entrega válidos para un pedido, recibe email
const orderBody = (email, productId, quantity = 1, extra = {}) => ({
  name: 'Ana',
  lastName: 'Prueba',
  email,
  phone: '3001112233',
  address: 'Calle 10 # 20-30, Medellín',
  items: [{ productId, quantity }],
  ...extra,
})

// Lee el pago y el pedido de un número de pedido, recibe orderId
const orderState = async (orderId) => {
  const [rows] = await getPool().query(
    'SELECT p.estadoPedido, pa.estadoPago, pa.monto FROM pedido p LEFT JOIN pago pa ON pa.idPedido = p.idPedido WHERE p.idPedido = ?',
    [orderId],
  )
  return rows[0]
}

// Firma un aviso como lo haría Mercado Pago, recibe dataId, requestId, ts
const sign = (dataId, requestId = 'req-1', ts = '1700000000') =>
  `ts=${ts},v1=${createHmac('sha256', 'secreto-de-prueba').update(`id:${dataId};request-id:${requestId};ts:${ts};`).digest('hex')}`

// Crea un pedido con Mercado Pago y devuelve su número, recibe productId, quantity
const createMercadoPagoOrder = async (productId, quantity = 1) => {
  const result = await call('/api/orders', { method: 'POST', body: orderBody(uniqueEmail(), productId, quantity, { paymentMethod: 'Mercado Pago' }) })
  assert.equal(result.status, 201, JSON.stringify(result.data))
  return result.data
}

describe('integración con base de datos', { skip: !enabled && 'define TEST_DATABASE_NAME=sweetlove_test para correrlas' }, () => {
  before(async () => {
    // Recrea la base de pruebas con el esquema y los datos de demostración
    const root = join(dirname(fileURLToPath(import.meta.url)), '..')
    execFileSync(process.execPath, ['scripts/db.js', 'init', '--force'], { cwd: root, env: process.env, stdio: 'pipe' })

    globalThis.fetch = fakeFetch
    ;({ getPool } = await import('../src/config/database.js'))
    ;({ outbox } = await import('../src/services/mailer.js'))
    paymentService = await import('../src/services/paymentService.js')
    ;({ orderToken } = await import('../src/utils/order-token.js'))
    const { createApp } = await import('../src/app.js')
    server = createApp().listen(0)
    await new Promise((resolve) => server.once('listening', resolve))
    baseUrl = `http://127.0.0.1:${server.address().port}`
    adminCookie = await login('carlos@gmail.com', 'SweetLove#2026')
  })

  after(async () => {
    globalThis.fetch = realFetch
    server?.close()
    await getPool?.().end()
  })

  describe('cuentas y contraseñas', () => {
    test('login: credenciales válidas entran y las incorrectas dan 401', async () => {
      const wrong = await call('/api/auth/login', { method: 'POST', body: { email: 'carlos@gmail.com', password: 'otra-clave-1' } })
      assert.equal(wrong.status, 401)
      assert.ok(adminCookie.includes('sweetlove-session'))
    })

    test('registro: pide verificar el correo antes de iniciar sesión', async () => {
      const email = uniqueEmail()
      const registered = await call('/api/auth/register', { method: 'POST', body: { fullName: 'Ana Prueba', email, password: 'ClaveSegura1' } })
      assert.equal(registered.status, 201)
      assert.equal(registered.data.needsVerification, true)

      const early = await call('/api/auth/login', { method: 'POST', body: { email, password: 'ClaveSegura1' } })
      assert.equal(early.status, 403)
      assert.equal(early.data.code, 'EMAIL_NOT_VERIFIED')

      const token = tokenFromLastMail(email)
      assert.equal((await call('/api/auth/verify-email', { method: 'POST', body: { token } })).status, 200)
      assert.equal((await call('/api/auth/login', { method: 'POST', body: { email, password: 'ClaveSegura1' } })).status, 200)
      // El enlace es de un solo uso
      assert.equal((await call('/api/auth/verify-email', { method: 'POST', body: { token } })).status, 400)
    })

    test('registro: rechaza contraseñas débiles, comunes o demasiado largas', async () => {
      for (const password of ['12345678', 'Password1', 'abcdefgh', 'soloLetrasAqui', `${'x'.repeat(80)}1`]) {
        const result = await call('/api/auth/register', { method: 'POST', body: { fullName: 'Ana Prueba', email: uniqueEmail(), password } })
        assert.equal(result.status, 400, password.slice(0, 12))
        assert.equal(result.data.code, 'WEAK_PASSWORD')
      }
    })

    test('recuperar contraseña: respuesta igual exista o no la cuenta, enlace de un solo uso y reglas de contraseña', async () => {
      const user = await createVerifiedUser()
      const before = outbox.length

      const unknown = await call('/api/auth/forgot-password', { method: 'POST', body: { email: uniqueEmail('nadie') } })
      const known = await call('/api/auth/forgot-password', { method: 'POST', body: { email: user.email } })
      assert.equal(unknown.status, 200)
      assert.equal(known.status, 200)
      assert.deepEqual(unknown.data, known.data)
      assert.equal(outbox.length, before + 1, 'solo la cuenta real recibe correo')

      const token = tokenFromLastMail(user.email)
      // Una contraseña débil no gasta el enlace
      assert.equal((await call('/api/auth/reset-password', { method: 'POST', body: { token, password: '12345678' } })).status, 400)
      assert.equal((await call('/api/auth/reset-password', { method: 'POST', body: { token, password: 'NuevaClave2' } })).status, 200)

      assert.equal((await call('/api/auth/login', { method: 'POST', body: { email: user.email, password: 'NuevaClave2' } })).status, 200)
      assert.equal((await call('/api/auth/login', { method: 'POST', body: { email: user.email, password: user.password } })).status, 401)
      assert.equal((await call('/api/auth/reset-password', { method: 'POST', body: { token, password: 'OtraClave3' } })).status, 400)
    })

    test('quien agota los intentos de un correo ajeno no deja afuera a su dueño: restablecer la contraseña lo desbloquea', async () => {
      const user = await createVerifiedUser()
      for (let attempt = 0; attempt < 10; attempt += 1) {
        const wrong = await call('/api/auth/login', { method: 'POST', body: { email: user.email, password: `incorrecta${attempt}` } })
        assert.equal(wrong.status, 401)
      }

      // Con los intentos agotados ni la contraseña correcta entra, y el aviso explica cómo desbloquear
      const locked = await call('/api/auth/login', { method: 'POST', body: { email: user.email, password: user.password } })
      assert.equal(locked.status, 429)
      assert.match(locked.data.statusMessage, /Olvidaste tu contraseña/)

      // El dueño pide el enlace por correo y elige una contraseña nueva: queda desbloqueado al instante
      await call('/api/auth/forgot-password', { method: 'POST', body: { email: user.email } })
      const reset = await call('/api/auth/reset-password', { method: 'POST', body: { token: tokenFromLastMail(user.email), password: 'ClaveDelDueno7' } })
      assert.equal(reset.status, 200)
      assert.equal((await call('/api/auth/login', { method: 'POST', body: { email: user.email, password: 'ClaveDelDueno7' } })).status, 200)
    })

    test('cambiar la contraseña cierra las sesiones de otros dispositivos y mantiene la actual', async () => {
      const user = await createVerifiedUser()
      const phone = await login(user.email, user.password)
      const laptop = await login(user.email, user.password)

      const change = await call('/api/auth/change-password', { method: 'POST', cookie: laptop, body: { currentPassword: user.password, newPassword: 'ClaveNueva2026' } })
      assert.equal(change.status, 200)

      // La sesión que hizo el cambio recibe una cookie nueva y sigue abierta
      assert.ok(change.cookie, 'el cambio entrega la cookie con la huella nueva')
      assert.equal((await call('/api/auth/me', { cookie: change.cookie })).data.user.email, user.email)

      // La otra sesión (abierta antes del cambio) ya no vale, ni para ver la cuenta ni para las rutas protegidas
      assert.equal((await call('/api/auth/me', { cookie: phone })).data.user, null)
      const blocked = await call('/api/auth/change-password', { method: 'POST', cookie: phone, body: { currentPassword: 'ClaveNueva2026', newPassword: 'OtraClave2026x' } })
      assert.equal(blocked.status, 401)
    })

    test('restablecer la contraseña con el enlace cierra todas las sesiones abiertas', async () => {
      const user = await createVerifiedUser()
      const cookie = await login(user.email, user.password)
      assert.equal((await call('/api/auth/me', { cookie })).data.user.email, user.email)

      await call('/api/auth/forgot-password', { method: 'POST', body: { email: user.email } })
      const reset = await call('/api/auth/reset-password', { method: 'POST', body: { token: tokenFromLastMail(user.email), password: 'ClaveRestable5' } })
      assert.equal(reset.status, 200)
      assert.equal((await call('/api/auth/me', { cookie })).data.user, null)
    })

    test('una sesión sin huella (de antes de esta versión) o con otra huella no vale', async () => {
      const { loadSessionUser } = await import('../src/middleware/auth.js')
      const { passwordStamp } = await import('../src/utils/session.js')
      const [[admin]] = await getPool().query("SELECT idUser, contrasena FROM usuario WHERE email = 'carlos@gmail.com'")

      const old = { session: { idUser: admin.idUser, idRol: 1 } }
      assert.equal(await loadSessionUser(old), null)
      assert.equal(old.session, null, 'la sesión inválida se cierra')

      const forged = { session: { idUser: admin.idUser, idRol: 1, stamp: 'huella-falsa' } }
      assert.equal(await loadSessionUser(forged), null)

      const valid = { session: { idUser: admin.idUser, idRol: 1, stamp: passwordStamp(admin.contrasena) } }
      assert.equal((await loadSessionUser(valid)).idUser, admin.idUser)
    })

    test('las reglas de contraseña y correo (sin espacios ni símbolos, de 8 a 16) se aplican en registro, restablecer y cambio', async () => {
      const fullName = 'Ana Prueba'

      // Registro: contraseña con espacios, símbolos, < >, corta; y correos con espacios
      for (const password of ['Clave 2026abc', 'Clave2026#abc', 'Clave<2026>x', 'Clave20', 'Clave2026Clave2026']) {
        const result = await call('/api/auth/register', { method: 'POST', body: { fullName, email: uniqueEmail(), password } })
        assert.equal(result.status, 400, password)
        assert.equal(result.data.code, 'WEAK_PASSWORD', password)
      }
      for (const email of [` ${uniqueEmail()}`, `${uniqueEmail()} `, uniqueEmail().replace('@', ' @')]) {
        const result = await call('/api/auth/register', { method: 'POST', body: { fullName, email, password: 'ClaveSegura1' } })
        assert.equal(result.status, 400, JSON.stringify(email))
        assert.equal(result.data.message, 'El correo no puede tener espacios.')
      }

      // Restablecer: una contraseña inválida no gasta el enlace
      const user = await createVerifiedUser()
      await call('/api/auth/forgot-password', { method: 'POST', body: { email: user.email } })
      const token = tokenFromLastMail(user.email)
      for (const password of ['Nueva clave 2026', 'Nueva#Clave2026', 'NuevaClave2026Larga']) {
        assert.equal((await call('/api/auth/reset-password', { method: 'POST', body: { token, password } })).status, 400, password)
      }
      assert.equal((await call('/api/auth/reset-password', { method: 'POST', body: { token, password: 'NuevaClave2026' } })).status, 200)

      // Cambio de contraseña desde la cuenta
      const cookie = await login(user.email, 'NuevaClave2026')
      for (const newPassword of ['Otra clave 2026', 'Otra<Clave>2026', 'Corta20', 'OtraClave2026Larga']) {
        assert.equal((await call('/api/auth/change-password', { method: 'POST', cookie, body: { currentPassword: 'NuevaClave2026', newPassword } })).status, 400, newPassword)
      }

      // Recuperar contraseña y reenviar verificación también rechazan correos con espacios
      assert.equal((await call('/api/auth/forgot-password', { method: 'POST', body: { email: `${user.email} ` } })).status, 400)
      assert.equal((await call('/api/auth/resend-verification', { method: 'POST', body: { email: ` ${user.email}` } })).status, 400)
    })

    test('un pedido con el correo con espacios se rechaza', async () => {
      const productId = await createProduct(2)
      const result = await call('/api/orders', { method: 'POST', body: orderBody(` ${uniqueEmail()} `, productId) })
      assert.equal(result.status, 400)
      assert.equal(await stockOf(productId), 2)
    })

    test('el registro guarda el apellido vacío con un solo nombre y avisa qué parte del nombre es muy larga', async () => {
      const register = (fullName, email = uniqueEmail()) => call('/api/auth/register', { method: 'POST', body: { fullName, email, password: 'ClaveSegura1' } })

      const single = uniqueEmail()
      assert.equal((await register('Ana', single)).status, 201)
      const [[saved]] = await getPool().query('SELECT nombre, apellido FROM usuario WHERE email = ?', [single])
      assert.deepEqual({ ...saved }, { nombre: 'Ana', apellido: '' }, 'el apellido queda vacío, no con un espacio')

      const full = uniqueEmail()
      assert.equal((await register('María José Pérez Gómez', full)).status, 201)
      const [[split]] = await getPool().query('SELECT nombre, apellido FROM usuario WHERE email = ?', [full])
      assert.deepEqual({ ...split }, { nombre: 'María', apellido: 'José Pérez Gómez' })

      const longName = await register('A'.repeat(51))
      assert.equal(longName.status, 400)
      assert.equal(longName.data.message, 'El nombre admite máximo 50 caracteres.')
      const longLastName = await register(`Ana ${'B'.repeat(51)}`)
      assert.equal(longLastName.status, 400)
      assert.equal(longLastName.data.message, 'El apellido admite máximo 50 caracteres.')
    })

    test('cambiar contraseña: pide la actual y aplica las reglas', async () => {
      const user = await createVerifiedUser()
      const cookie = await login(user.email, user.password)

      assert.equal((await call('/api/auth/change-password', { method: 'POST', body: { currentPassword: 'incorrecta1', newPassword: 'NuevaClave2' } })).status, 401)
      const wrong = await call('/api/auth/change-password', { method: 'POST', cookie, body: { currentPassword: 'incorrecta1', newPassword: 'NuevaClave2' } })
      assert.equal(wrong.status, 400)
      assert.equal((await call('/api/auth/change-password', { method: 'POST', cookie, body: { currentPassword: user.password, newPassword: user.password } })).status, 400)
      assert.equal((await call('/api/auth/change-password', { method: 'POST', cookie, body: { currentPassword: user.password, newPassword: '12345678' } })).status, 400)
      assert.equal((await call('/api/auth/change-password', { method: 'POST', cookie, body: { currentPassword: user.password, newPassword: 'NuevaClave2' } })).status, 200)
      assert.equal((await call('/api/auth/login', { method: 'POST', body: { email: user.email, password: 'NuevaClave2' } })).status, 200)
    })

    test('invitado: la compra no sobrescribe cuentas y el dueño del correo puede activar la suya', async () => {
      // Cuenta existente con datos propios: la compra no los cambia, pero el pedido guarda su propia entrega
      const user = await createVerifiedUser()
      await getPool().execute("UPDATE usuario SET celular = '3000000000', direccion = 'Mi casa 123' WHERE email = ?", [user.email])
      const productId = await createProduct(5)
      const order = await call('/api/orders', { method: 'POST', body: orderBody(user.email, productId, 1, { name: 'Otra', address: 'Entrega en otro lugar 45' }) })
      assert.equal(order.status, 201)
      const [[account]] = await getPool().query('SELECT nombre, celular, direccion FROM usuario WHERE email = ?', [user.email])
      assert.equal(account.nombre, 'Ana')
      assert.equal(account.celular, '3000000000')
      assert.equal(account.direccion, 'Mi casa 123')
      const [[shipping]] = await getPool().query('SELECT nombreEnvio, direccionEnvio FROM pedido WHERE idPedido = ?', [order.data.idPedido])
      assert.equal(shipping.direccionEnvio, 'Entrega en otro lugar 45')

      // Compra como invitado: se crea una cuenta que no permite entrar
      const guest = uniqueEmail('invitado')
      assert.equal((await call('/api/orders', { method: 'POST', body: orderBody(guest, productId) })).status, 201)
      const [[guestRow]] = await getPool().query('SELECT esInvitado, emailVerificado FROM usuario WHERE email = ?', [guest])
      assert.equal(Number(guestRow.esInvitado), 1)
      assert.equal(Number(guestRow.emailVerificado), 0)
      assert.equal((await call('/api/auth/login', { method: 'POST', body: { email: guest, password: 'ClaveSegura1' } })).status, 401)

      // Registrarse con ese correo envía un enlace para activarla; la clave escrita en el formulario no se usa
      const claim = await call('/api/auth/register', { method: 'POST', body: { fullName: 'Ana Prueba', email: guest, password: 'ClaveSegura1' } })
      assert.equal(claim.status, 201)
      assert.equal((await call('/api/auth/login', { method: 'POST', body: { email: guest, password: 'ClaveSegura1' } })).status, 401)
      const token = tokenFromLastMail(guest)
      assert.equal((await call('/api/auth/reset-password', { method: 'POST', body: { token, password: 'MiClaveNueva9' } })).status, 200)
      assert.equal((await call('/api/auth/login', { method: 'POST', body: { email: guest, password: 'MiClaveNueva9' } })).status, 200)
      const [[claimed]] = await getPool().query('SELECT esInvitado FROM usuario WHERE email = ?', [guest])
      assert.equal(Number(claimed.esInvitado), 0)
    })
  })

  describe('pedidos y stock', () => {
    test('el backend valida celular, dirección, nombre y productos', async () => {
      const productId = await createProduct(5)
      const base = orderBody(uniqueEmail(), productId)
      for (const [label, change] of [
        ['celular con letras', { phone: 'abc1234567' }],
        ['celular corto', { phone: '123' }],
        ['celular de más de 10 números', { phone: '30012345678' }],
        ['sin dirección', { address: '' }],
        ['dirección corta', { address: 'Cll 1' }],
        ['nombre de una letra', { name: 'A' }],
        ['correo inválido', { email: 'no-es-correo' }],
        ['cantidad cero', { items: [{ productId, quantity: 0 }] }],
      ]) {
        const result = await call('/api/orders', { method: 'POST', body: { ...base, ...change } })
        assert.equal(result.status, 400, label)
      }
      assert.equal(await stockOf(productId), 5, 'ningún pedido inválido descuenta stock')
    })

    test('cinco compras simultáneas de la última unidad: solo una se concreta', async () => {
      const productId = await createProduct(1)
      const results = await Promise.all(
        Array.from({ length: 5 }, () => call('/api/orders', { method: 'POST', body: orderBody(uniqueEmail(), productId) })),
      )
      assert.equal(results.filter((result) => result.status === 201).length, 1)
      assert.equal(results.filter((result) => result.status === 409).length, 4)
      assert.equal(await stockOf(productId), 0)
    })

    test('cancelar un pedido devuelve el stock una sola vez y no se puede reactivar', async () => {
      const productId = await createProduct(5)
      const order = await call('/api/orders', { method: 'POST', body: orderBody(uniqueEmail(), productId, 2) })
      assert.equal(await stockOf(productId), 3)

      // Cancela el pedido como administrador
      const cancel = () => call(`/api/orders/${order.data.idPedido}`, { method: 'PATCH', cookie: adminCookie, body: { status: 'Cancelado' } })
      assert.equal((await cancel()).status, 200)
      assert.equal(await stockOf(productId), 5)
      assert.equal((await cancel()).status, 200)
      assert.equal(await stockOf(productId), 5, 'una segunda cancelación no devuelve stock otra vez')

      const reactivate = await call(`/api/orders/${order.data.idPedido}`, { method: 'PATCH', cookie: adminCookie, body: { status: 'Pendiente' } })
      assert.equal(reactivate.status, 409)
    })

    test('las líneas repetidas del mismo producto se suman y no dejan el stock en negativo', async () => {
      const productId = await createProduct(5)
      const twice = (quantity) => ({ items: [{ productId, quantity }, { productId, quantity }] })

      const tooMany = await call('/api/orders', { method: 'POST', body: orderBody(uniqueEmail(), productId, 1, twice(3)) })
      assert.equal(tooMany.status, 409)
      assert.equal(await stockOf(productId), 5, 'un pedido rechazado no descuenta stock')

      const fits = await call('/api/orders', { method: 'POST', body: orderBody(uniqueEmail(), productId, 1, twice(2)) })
      assert.equal(fits.status, 201)
      assert.equal(fits.data.cantidadProductos, 1, 'las dos líneas quedan unidas en una sola')
      assert.equal(await stockOf(productId), 1)
    })

    test('el descuento de stock se niega si no alcanza (nunca queda en negativo)', async () => {
      const productId = await createProduct(2)
      const productModel = await import('../src/models/productModel.js')
      const connection = await getPool().getConnection()
      try {
        assert.equal(await productModel.decreaseStock(connection, productId, 3), false)
        assert.equal(await productModel.decreaseStock(connection, productId, 2), true)
      } finally {
        connection.release()
      }
      assert.equal(await stockOf(productId), 0)
    })

    test('un pedido no puede traer demasiadas líneas ni demasiadas unidades', async () => {
      const productId = await createProduct(500)
      const post = (extra) => call('/api/orders', { method: 'POST', body: orderBody(uniqueEmail(), productId, 1, extra) })

      const manyLines = Array.from({ length: 31 }, () => ({ productId, quantity: 1 }))
      assert.equal((await post({ items: manyLines })).status, 400, '31 líneas')
      assert.equal((await post({ items: [{ productId, quantity: 51 }] })).status, 400, '51 unidades')
      assert.equal((await post({ items: [{ productId, quantity: 30 }, { productId, quantity: 30 }] })).status, 400, 'repetidas que suman 60')
      assert.equal((await post({ items: 'muchos' })).status, 400, 'items no es una lista')
      assert.equal((await post({ items: [null] })).status, 400, 'línea vacía')
      assert.equal((await post({ items: [{ productId, quantity: 1.5 }] })).status, 400, 'cantidad con decimales')
      assert.equal((await post({ items: [] })).status, 400, 'sin productos')
      assert.equal(await stockOf(productId), 500, 'ningún pedido inválido descuenta stock')
      assert.equal((await post({ items: [{ productId, quantity: 50 }] })).status, 201, 'el máximo permitido sí pasa')
    })

    test('el medio de pago es de una lista cerrada: uno inventado se rechaza y sin medio se usa Mercado Pago', async () => {
      const productId = await createProduct(5)
      const invented = await call('/api/orders', { method: 'POST', body: orderBody(uniqueEmail(), productId, 1, { paymentMethod: 'Bitcoin' }) })
      assert.equal(invented.status, 400)
      assert.equal(await stockOf(productId), 5)

      const missing = await call('/api/orders', { method: 'POST', body: orderBody(uniqueEmail(), productId) })
      assert.equal(missing.status, 201)
      assert.ok(missing.data.initPoint.includes('mercadopago'), 'sin medio de pago se crea el enlace de Mercado Pago')
      const [[{ medio }]] = await getPool().query('SELECT proveedorPago AS medio FROM pago WHERE idPedido = ?', [missing.data.idPedido])
      assert.equal(medio, 'Mercado Pago')
    })

    test('un mismo correo no puede crear más de 10 pedidos por hora (los rechazados no cuentan)', async () => {
      const productId = await createProduct(30)
      const email = uniqueEmail('masivo')

      // Pedidos inválidos: se rechazan y no gastan el cupo
      for (let attempt = 0; attempt < 3; attempt += 1) {
        assert.equal((await call('/api/orders', { method: 'POST', body: orderBody(email, productId, 1, { phone: 'abc' }) })).status, 400)
      }
      for (let order = 1; order <= 10; order += 1) {
        assert.equal((await call('/api/orders', { method: 'POST', body: orderBody(email, productId) })).status, 201, `pedido ${order}`)
      }
      const blocked = await call('/api/orders', { method: 'POST', body: orderBody(email, productId) })
      assert.equal(blocked.status, 429)
      assert.equal(await stockOf(productId), 20, 'el pedido bloqueado no descuenta stock')
    })
  })

  describe('estados de un pedido', () => {
    // Cambia el estado de un pedido como administrador, recibe orderId, status
    const patchStatus = (orderId, status) => call(`/api/orders/${orderId}`, { method: 'PATCH', cookie: adminCookie, body: { status } })
    // Marca el pago de un pedido como aprobado (lo que haría Mercado Pago), recibe orderId
    const approvePayment = (orderId) => getPool().query("UPDATE pago SET estadoPago = 'Aprobado' WHERE idPedido = ?", [orderId])

    test('sin pago aprobado no sale de Pendiente; con pago solo avanza y no vuelve atrás', async () => {
      const order = await createMercadoPagoOrder(await createProduct(5))
      const id = order.idPedido

      for (const status of ['En preparación', 'Enviado', 'Completado']) {
        const blocked = await patchStatus(id, status)
        assert.equal(blocked.status, 409, status)
        assert.match(blocked.data.message, /pago no está aprobado/)
      }

      await approvePayment(id)
      assert.equal((await patchStatus(id, 'En preparación')).status, 200)
      assert.equal((await patchStatus(id, 'Pendiente')).status, 409, 'no vuelve a Pendiente')
      assert.equal((await patchStatus(id, 'Enviado')).status, 200)
      assert.equal((await patchStatus(id, 'Cancelado')).status, 409, 'un pedido enviado ya no se cancela')
      assert.equal((await patchStatus(id, 'En preparación')).status, 409, 'no vuelve atrás')
      assert.equal((await patchStatus(id, 'Completado')).status, 200)
      for (const status of ['Pendiente', 'En preparación', 'Enviado', 'Cancelado']) {
        assert.equal((await patchStatus(id, status)).status, 409, `Completado no pasa a ${status}`)
      }
      assert.equal((await patchStatus(id, 'Completado')).status, 200, 'repetir el estado actual no falla')
      assert.equal((await orderState(id)).estadoPedido, 'Completado')
    })

    test('cancelar un pedido ya pagado avisa del reembolso y no toca el pago; uno sin pagar no avisa', async () => {
      const productId = await createProduct(5)
      const paid = await createMercadoPagoOrder(productId, 2)
      await approvePayment(paid.idPedido)
      assert.equal(await stockOf(productId), 3)

      const cancelPaid = await patchStatus(paid.idPedido, 'Cancelado')
      assert.equal(cancelPaid.status, 200)
      assert.equal(cancelPaid.data.refundPending, true)
      assert.equal(await stockOf(productId), 5, 'el stock vuelve al inventario')
      assert.equal((await orderState(paid.idPedido)).estadoPago, 'Aprobado', 'el pago aprobado se conserva hasta reembolsarlo')

      const unpaid = await createMercadoPagoOrder(productId, 1)
      const cancelUnpaid = await patchStatus(unpaid.idPedido, 'Cancelado')
      assert.equal(cancelUnpaid.status, 200)
      assert.equal(cancelUnpaid.data.refundPending, undefined)
    })
  })

  describe('pagos con Mercado Pago (simulado)', () => {
    test('el enlace de pago vence con el plazo del pedido', async () => {
      const productId = await createProduct(3, 20000)
      const order = await createMercadoPagoOrder(productId, 2)
      assert.ok(order.initPoint.includes('mercadopago.com.co'))
      assert.equal(mp.lastPreference.expires, true)
      const minutes = (new Date(mp.lastPreference.expiration_date_to) - new Date(mp.lastPreference.expiration_date_from)) / 60000
      assert.equal(Math.round(minutes), 30)
      assert.equal(mp.lastPreference.items[0].unit_price, 20000)
      // Las direcciones de regreso llevan el pedido y su código para poder confirmar el pago
      for (const url of Object.values(mp.lastPreference.back_urls)) {
        assert.match(url, new RegExp(`[?&]pedido=${order.idPedido}&t=${orderToken(order.idPedido)}$`))
      }
    })

    test('aviso firmado con pago aprobado y monto correcto: el pago queda Aprobado', async () => {
      const order = await createMercadoPagoOrder(await createProduct(3, 15000))
      mp.payments.set(String(order.idPedido), [{ id: 9001, status: 'approved', transaction_amount: 15000, currency_id: 'COP', external_reference: String(order.idPedido) }])

      const notice = await call('/api/payments/webhook?type=payment&data.id=9001', { method: 'POST', headers: { 'x-signature': sign('9001'), 'x-request-id': 'req-1' }, body: {} })
      assert.equal(notice.status, 200)
      assert.equal((await orderState(order.idPedido)).estadoPago, 'Aprobado')
    })

    test('confirmar un pago sin el código del enlace de regreso, o con uno falso, se rechaza y no consulta nada', async () => {
      const order = await createMercadoPagoOrder(await createProduct(3, 15000))
      mp.payments.set(String(order.idPedido), [{ id: 9010, status: 'approved', transaction_amount: 15000, currency_id: 'COP', external_reference: String(order.idPedido) }])

      for (const body of [{ orderId: order.idPedido }, { orderId: order.idPedido, token: 'falso' }, { orderId: order.idPedido, token: orderToken(order.idPedido + 1) }]) {
        const result = await call('/api/payments/confirm', { method: 'POST', body })
        assert.equal(result.status, 403, JSON.stringify(body))
      }
      assert.equal((await orderState(order.idPedido)).estadoPago, 'Pendiente', 'el pago no cambia sin el código')

      const valid = await call('/api/payments/confirm', { method: 'POST', body: { orderId: order.idPedido, token: orderToken(order.idPedido) } })
      assert.equal(valid.status, 200)
      assert.equal((await orderState(order.idPedido)).estadoPago, 'Aprobado')
    })

    test('aviso sin firma o con firma falsa se rechaza', async () => {
      const none = await call('/api/payments/webhook?type=payment&data.id=9002', { method: 'POST', body: {} })
      const fake = await call('/api/payments/webhook?type=payment&data.id=9002', { method: 'POST', headers: { 'x-signature': 'ts=1,v1=falsa', 'x-request-id': 'req-1' }, body: {} })
      assert.equal(none.status, 401)
      assert.equal(fake.status, 401)
    })

    test('un pago aprobado con otro monto no se acepta', async () => {
      const order = await createMercadoPagoOrder(await createProduct(3, 15000))
      mp.payments.set(String(order.idPedido), [{ id: 9003, status: 'approved', transaction_amount: 1, currency_id: 'COP', external_reference: String(order.idPedido) }])

      const confirm = await call('/api/payments/confirm', { method: 'POST', body: { orderId: order.idPedido, token: orderToken(order.idPedido) } })
      assert.equal(confirm.status, 200)
      assert.equal((await orderState(order.idPedido)).estadoPago, 'Pendiente')
    })

    test('confirmar al volver de Mercado Pago actualiza el pago sin esperar el aviso', async () => {
      const order = await createMercadoPagoOrder(await createProduct(3, 15000))
      mp.payments.set(String(order.idPedido), [{ id: 9004, status: 'approved', transaction_amount: 15000, currency_id: 'COP', external_reference: String(order.idPedido) }])

      const confirm = await call('/api/payments/confirm', { method: 'POST', body: { orderId: order.idPedido, token: orderToken(order.idPedido) } })
      assert.equal(confirm.data.status, 'Aprobado')
      assert.equal((await orderState(order.idPedido)).estadoPago, 'Aprobado')
    })

    test('pedidos vencidos: se cancelan y devuelven el stock, salvo los pagados o en proceso', async () => {
      const productId = await createProduct(10, 5000)
      const unpaid = await createMercadoPagoOrder(productId, 2)
      const paid = await createMercadoPagoOrder(productId, 1)
      const processing = await createMercadoPagoOrder(productId, 1)
      const fresh = await createMercadoPagoOrder(productId, 1)
      assert.equal(await stockOf(productId), 5)

      mp.payments.set(String(paid.idPedido), [{ id: 9005, status: 'approved', transaction_amount: 5000, currency_id: 'COP' }])
      mp.payments.set(String(processing.idPedido), [{ id: 9006, status: 'in_process', transaction_amount: 5000, currency_id: 'COP' }])
      // Los tres primeros ya pasaron el plazo; el último es reciente
      await getPool().execute('UPDATE pedido SET creadoEn = DATE_SUB(NOW(), INTERVAL 2 HOUR) WHERE idPedido IN (?, ?, ?)', [unpaid.idPedido, paid.idPedido, processing.idPedido])

      await paymentService.expireStaleOrders()

      assert.deepEqual(await orderState(unpaid.idPedido), { estadoPedido: 'Cancelado', estadoPago: 'Expirado', monto: 10000 })
      assert.equal((await orderState(paid.idPedido)).estadoPago, 'Aprobado')
      assert.equal((await orderState(paid.idPedido)).estadoPedido, 'Pendiente')
      assert.equal((await orderState(processing.idPedido)).estadoPago, 'En proceso')
      assert.equal((await orderState(processing.idPedido)).estadoPedido, 'Pendiente')
      assert.equal((await orderState(fresh.idPedido)).estadoPedido, 'Pendiente')
      assert.equal(await stockOf(productId), 7, 'solo se devolvieron las 2 unidades del pedido vencido')
    })

    test('si Mercado Pago no responde, un pedido vencido no se cancela (podría estar pagado)', async () => {
      const productId = await createProduct(5)
      const order = await createMercadoPagoOrder(productId)
      await getPool().execute('UPDATE pedido SET creadoEn = DATE_SUB(NOW(), INTERVAL 2 HOUR) WHERE idPedido = ?', [order.idPedido])

      mp.failSearch = true
      try {
        await paymentService.expireStaleOrders()
      } finally {
        mp.failSearch = false
      }
      assert.equal((await orderState(order.idPedido)).estadoPedido, 'Pendiente')
      assert.equal(await stockOf(productId), 4)
    })
  })

  describe('imagen de los productos', () => {
    test('un producto acepta una URL como imagen al crearse y al editarse, y rechaza valores peligrosos', async () => {
      const url = 'https://sitio.example.com/fotos/oso.jpg'
      const created = await call('/api/products', { method: 'POST', cookie: adminCookie, body: { name: 'Con URL', price: 1000, stock: 1, image: url } })
      assert.equal(created.status, 201)
      assert.equal(created.data.producto.image, url)

      const id = created.data.producto.id
      const other = 'https://otro.example.com/foto.png'
      const updated = await call(`/api/products/${id}`, { method: 'PUT', cookie: adminCookie, body: { name: 'Con URL', price: 1000, stock: 1, image: other } })
      assert.equal(updated.status, 200)
      const list = await call('/api/products')
      assert.equal(list.data.find((product) => product.id === id).image, other)

      // Un valor peligroso se rechaza y, al crear, no deja un producto a medias
      const [[{ total: before }]] = await getPool().query('SELECT COUNT(*) AS total FROM producto')
      const bad = await call('/api/products', { method: 'POST', cookie: adminCookie, body: { name: 'Mala', price: 1000, stock: 1, image: 'javascript:alert(1)' } })
      assert.equal(bad.status, 400)
      const [[{ total: after }]] = await getPool().query('SELECT COUNT(*) AS total FROM producto')
      assert.equal(Number(after), Number(before))
      assert.equal((await call(`/api/products/${id}`, { method: 'PUT', cookie: adminCookie, body: { name: 'Con URL', price: 1000, stock: 1, image: 'javascript:alert(1)' } })).status, 400)
    })
  })

  describe('productos: validaciones', () => {
    // Crea un producto como administrador, recibe body
    const createRaw = (body) => call('/api/products', { method: 'POST', cookie: adminCookie, body })

    test('rechaza proveedor inexistente, precio 0 o fuera de rango, stock inválido y estado que no es verdadero o falso', async () => {
      const base = { name: 'Validación', price: 1000, stock: 5 }
      for (const [label, change] of [
        ['proveedor inexistente', { supplierId: 99999999 }],
        ['precio 0', { price: 0 }],
        ['precio mayor a un INT', { price: 3000000000 }],
        ['precio con decimales', { price: 1500.5 }],
        ['precio negativo', { price: -5 }],
        ['precio en texto', { price: 'barato' }],
        ['stock negativo', { stock: -1 }],
        ['stock enorme', { stock: 100000 }],
        ['estado como texto', { active: 'false' }],
      ]) {
        assert.equal((await createRaw({ ...base, ...change })).status, 400, label)
      }
      const [[{ total }]] = await getPool().query("SELECT COUNT(*) AS total FROM producto WHERE nombre = 'Validación'")
      assert.equal(Number(total), 0, 'ningún producto inválido se guarda')
      assert.equal((await createRaw({ ...base, price: 99999999, stock: 99999 })).status, 201, 'los máximos sí pasan')
    })

    test('el error de un proveedor que no existe lo dice con claridad (no es un error interno)', async () => {
      const result = await createRaw({ name: 'Con proveedor falso', price: 1000, stock: 1, supplierId: 99999999 })
      assert.equal(result.status, 400)
      assert.equal(result.data.message, 'El proveedor no existe.')
    })

    test('editar un producto conserva lo que no se envía, y null lo borra a propósito', async () => {
      const created = await createRaw({ name: 'Conserva', description: 'Descripción original', price: 2000, stock: 3, active: false, supplierId: 1, image: 'https://example.com/a.jpg' })
      assert.equal(created.status, 201, JSON.stringify(created.data))
      const id = created.data.producto.id
      const readRow = async () => (await getPool().query('SELECT nombre, descripcion, precio, cantidad, imagen, estado, idProveedor FROM producto WHERE idProducto = ?', [id]))[0][0]

      // El panel no envía el proveedor ni el estado: no deben perderse
      assert.equal((await call(`/api/products/${id}`, { method: 'PUT', cookie: adminCookie, body: { name: 'Conserva 2', price: 2500, stock: 4 } })).status, 200)
      assert.deepEqual({ ...(await readRow()) }, { nombre: 'Conserva 2', descripcion: 'Descripción original', precio: 2500, cantidad: 4, imagen: 'https://example.com/a.jpg', estado: 0, idProveedor: 1 })

      const cleared = await call(`/api/products/${id}`, { method: 'PUT', cookie: adminCookie, body: { name: 'Conserva 2', price: 2500, stock: 4, image: null, supplierId: null, active: true } })
      assert.equal(cleared.status, 200)
      assert.deepEqual({ ...(await readRow()) }, { nombre: 'Conserva 2', descripcion: 'Descripción original', precio: 2500, cantidad: 4, imagen: null, estado: 1, idProveedor: null })
    })
  })

  describe('seguridad', () => {
    test('un formulario de otro sitio (text/plain) no crea pedidos ni cambia nada', async () => {
      const productId = await createProduct(2)
      const response = await realFetch(`${baseUrl}/api/orders`, {
        method: 'POST',
        headers: { 'content-type': 'text/plain' },
        body: JSON.stringify(orderBody(uniqueEmail(), productId)),
      })
      assert.equal(response.status, 400)
      assert.equal(await stockOf(productId), 2)
    })

    test('CORS cerrado y cabeceras de seguridad presentes', async () => {
      const preflight = await realFetch(`${baseUrl}/api/orders`, { method: 'OPTIONS', headers: { origin: 'https://sitio-malo.example', 'access-control-request-method': 'POST' } })
      assert.equal(preflight.headers.get('access-control-allow-origin'), null)

      const response = await call('/api/auth/me')
      assert.equal(response.headers.get('x-content-type-options'), 'nosniff')
      assert.equal(response.headers.get('x-powered-by'), null)
    })

    test('un cliente no puede usar las rutas de administrador', async () => {
      const user = await createVerifiedUser()
      const cookie = await login(user.email, user.password)
      assert.equal((await call('/api/orders', { cookie })).status, 403)
      assert.equal((await call('/api/products', { method: 'POST', cookie, body: { name: 'X', price: 1, stock: 1 } })).status, 403)
    })
  })
})
