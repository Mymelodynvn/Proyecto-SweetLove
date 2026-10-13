// Pruebas de la validación de la imagen de un producto (archivo, ruta propia o URL), sin base de datos
import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { parseImageReference } from '../src/utils/product-image.js'

describe('imagen de un producto', () => {
  test('acepta vacía, ruta propia y URL http o https', () => {
    assert.equal(parseImageReference(undefined), null)
    assert.equal(parseImageReference(''), null)
    assert.equal(parseImageReference('   '), null)
    assert.equal(parseImageReference('/uploads/products/producto-3-1.jpg'), '/uploads/products/producto-3-1.jpg')
    assert.equal(parseImageReference('/tienda/assets/images/combox6.jpeg'), '/tienda/assets/images/combox6.jpeg')
    assert.equal(parseImageReference(' https://sitio.com/foto.jpg?x=1 '), 'https://sitio.com/foto.jpg?x=1')
    assert.equal(parseImageReference('http://sitio.com/foto.png'), 'http://sitio.com/foto.png')
  })

  test('deja pasar una imagen en Data URL para que el controlador la guarde como archivo', () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgo='
    assert.equal(parseImageReference(dataUrl), dataUrl)
  })

  test('rechaza esquemas peligrosos, rutas raras, espacios y textos demasiado largos', () => {
    for (const value of [
      'javascript:alert(1)',
      'data:text/html;base64,PGgxPg==',
      'ftp://sitio.com/foto.jpg',
      '//sitio.com/foto.jpg',
      '/uploads/../secreto.jpg',
      'foto.jpg',
      'https://',
      'https://sitio.com/mi foto.jpg',
      `https://sitio.com/${'a'.repeat(300)}.jpg`,
      42,
      { url: 'https://sitio.com/foto.jpg' },
    ]) {
      assert.throws(() => parseImageReference(value), (error) => error.statusCode === 400, String(value).slice(0, 30))
    }
  })
})
