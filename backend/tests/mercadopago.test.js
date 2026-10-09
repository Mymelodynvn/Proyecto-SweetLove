// Pruebas de Mercado Pago sin red ni base de datos: la API se simula y las variables se fijan antes de cargar el código
import { after, before, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'

process.env.MP_ACCESS_TOKEN = 'APP_USR-token-de-prueba'
process.env.MP_WEBHOOK_SECRET = 'secreto-de-prueba'
process.env.MP_CURRENCY_ID = 'COP'
process.env.FRONTEND_URL = 'https://tienda.example.com'
process.env.BACKEND_PUBLIC_URL = 'https://api.example.com/'

const mercadoPago = await import('../src/services/mercadoPagoService.js')
const { createApp } = await import('../src/app.js')

const realFetch = globalThis.fetch
let server
let baseUrl

before(async () => {
  server = createApp().listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(() => {
  globalThis.fetch = realFetch
  server.close()
})

// Simula la API de Mercado Pago y guarda la última petición, recibe status, data
const mockMercadoPago = (status, data) => {
  const calls = []
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options })
    return { ok: status >= 200 && status < 300, status, json: async () => data }
  }
  return calls
}

// Firma un aviso como lo haría Mercado Pago, recibe dataId, requestId, ts
const sign = (dataId, requestId, ts) => {
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`
  return `ts=${ts},v1=${createHmac('sha256', 'secreto-de-prueba').update(manifest).digest('hex')}`
}

describe('estado del pago', () => {
  test('traduce los estados de Mercado Pago a los de la tabla pago', () => {
    assert.equal(mercadoPago.mapPaymentStatus('approved'), 'Aprobado')
    assert.equal(mercadoPago.mapPaymentStatus('rejected'), 'Rechazado')
    assert.equal(mercadoPago.mapPaymentStatus('cancelled'), 'Rechazado')
    assert.equal(mercadoPago.mapPaymentStatus('refunded'), 'Reembolsado')
    assert.equal(mercadoPago.mapPaymentStatus('in_process'), 'Pendiente')
    assert.equal(mercadoPago.mapPaymentStatus('pending'), 'Pendiente')
  })
})

describe('enlace de pago (preferencia)', () => {
  const items = [
    { productId: 1, title: 'Caja de chocolates', quantity: 2, unitPrice: 45000 },
    { productId: 3, title: 'Oso con chocolates', quantity: 1, unitPrice: 85000 },
  ]

  test('envía los productos, el pedido y las direcciones correctas', async () => {
    const calls = mockMercadoPago(201, { id: 'pref-1', init_point: 'https://www.mercadopago.com.co/pagar/abc' })
    const result = await mercadoPago.createPreference({ orderId: 7, items })

    assert.equal(result.initPoint, 'https://www.mercadopago.com.co/pagar/abc')
    assert.equal(calls[0].url, 'https://api.mercadopago.com/checkout/preferences')
    assert.equal(calls[0].options.headers.Authorization, 'Bearer APP_USR-token-de-prueba')
    assert.equal(calls[0].options.headers['X-Idempotency-Key'], 'pedido-7')

    const body = JSON.parse(calls[0].options.body)
    assert.deepEqual(body.items[0], { id: '1', title: 'Caja de chocolates', quantity: 2, unit_price: 45000, currency_id: 'COP' })
    assert.equal(body.items.length, 2)
    assert.equal(body.external_reference, '7')
    assert.equal(body.back_urls.success, 'https://tienda.example.com/tienda/pagoResultado.html?resultado=exito')
    assert.equal(body.back_urls.failure, 'https://tienda.example.com/tienda/pagoResultado.html?resultado=fallo')
    assert.equal(body.auto_return, 'approved')
    // la barra final de BACKEND_PUBLIC_URL se quita
    assert.equal(body.notification_url, 'https://api.example.com/api/payments/webhook')
  })

  test('si Mercado Pago rechaza la petición, lanza un error 502 sin filtrar detalles', async () => {
    mockMercadoPago(400, { message: 'detalle interno' })
    await assert.rejects(
      () => mercadoPago.createPreference({ orderId: 8, items }),
      (error) => error.statusCode === 502 && !error.message.includes('detalle interno'),
    )
  })
})

describe('firma de los avisos', () => {
  test('acepta una firma válida', () => {
    const signature = sign('12345', 'req-1', '1700000000')
    assert.equal(mercadoPago.verifyWebhookSignature({ signature, requestId: 'req-1', dataId: '12345' }), true)
  })

  test('rechaza una firma alterada, de otro pago o ausente', () => {
    const signature = sign('12345', 'req-1', '1700000000')
    assert.equal(mercadoPago.verifyWebhookSignature({ signature, requestId: 'req-1', dataId: '99999' }), false)
    assert.equal(mercadoPago.verifyWebhookSignature({ signature: 'ts=1,v1=abc', requestId: 'req-1', dataId: '12345' }), false)
    assert.equal(mercadoPago.verifyWebhookSignature({ signature: undefined, requestId: 'req-1', dataId: '12345' }), false)
  })
})

describe('ruta del aviso (webhook)', () => {
  // Envía un aviso al backend de prueba, recibe query, headers
  const aviso = (query = '', headers = {}) =>
    realFetch(`${baseUrl}/api/payments/webhook${query}`, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: '{}' })

  test('ignora los avisos que no son de pagos', async () => {
    const response = await aviso('?type=merchant_order&data.id=1')
    assert.equal(response.status, 200)
    assert.equal((await response.json()).ignored, true)
  })

  test('rechaza con 401 un aviso de pago con firma falsa', async () => {
    const response = await aviso('?type=payment&data.id=12345', { 'x-signature': 'ts=1,v1=falsa', 'x-request-id': 'req-1' })
    assert.equal(response.status, 401)
  })

  test('responde 200 si el pago no existe en Mercado Pago (así no se repite el aviso)', async () => {
    mockMercadoPago(404, { message: 'Payment not found' })
    const response = await aviso('?type=payment&data.id=12345', { 'x-signature': sign('12345', 'req-1', '1700000000'), 'x-request-id': 'req-1' })
    assert.equal(response.status, 200)
    assert.equal((await response.json()).ignored, true)
  })
})
