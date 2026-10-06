// constants.ts — constantes compartidas del panel (colores, claves y límites de imagen)
// Paleta de colores de Sweet Love, alineada con la hoja de estilos del frontend.
// Paleta de colores de Sweet Love, alineada con la hoja de estilos de la tienda
export const BRAND_COLORS = {
  cream: '#FFFDEC',
  green: '#6C8D6F',
  greenDark: '#5D7B60',
  pink: '#FFE2E2',
  pinkDeep: '#F6C6CD',
  rose: '#C97B7B',
} as const

// Clave de localStorage donde se guarda el tema elegido
export const THEME_STORAGE_KEY = 'sweet-love-admin-theme'

// Las fotos de productos se reducen en el navegador antes de guardarse como Data URL.
export const PRODUCT_IMAGE_MAX_DIMENSION_PX = 480
export const PRODUCT_IMAGE_JPEG_QUALITY = 0.82
