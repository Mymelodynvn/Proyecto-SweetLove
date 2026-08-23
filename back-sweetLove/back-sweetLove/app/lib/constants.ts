// Sweet Love brand palette, mirrored from the frontend site stylesheet.
export const BRAND_COLORS = {
  cream: '#FFFDEC',
  green: '#6C8D6F',
  greenDark: '#5D7B60',
  pink: '#FFE2E2',
  pinkDeep: '#F6C6CD',
  rose: '#C97B7B',
} as const

export const THEME_STORAGE_KEY = 'sweet-love-admin-theme'

// Product photos are downscaled client-side before persisting as data URLs.
export const PRODUCT_IMAGE_MAX_DIMENSION_PX = 480
export const PRODUCT_IMAGE_JPEG_QUALITY = 0.82
