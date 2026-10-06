// read-image-file.ts — preparación de imágenes de producto en el navegador
import { PRODUCT_IMAGE_JPEG_QUALITY, PRODUCT_IMAGE_MAX_DIMENSION_PX } from '~/lib/constants'

// Lee una imagen y devuelve una Data URL JPEG reducida para poder
// guardarla temporalmente sin agotar el espacio disponible del navegador.
// Lee una imagen, la reduce de tamaño y la devuelve como Data URL JPEG, recibe file
export const readImageAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const scale = Math.min(1, PRODUCT_IMAGE_MAX_DIMENSION_PX / Math.max(image.width, image.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(image.width * scale)
      canvas.height = Math.round(image.height * scale)
      const context = canvas.getContext('2d')
      if (!context) {
        reject(new Error('No se pudo crear el lienzo para procesar la imagen.'))
        return
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', PRODUCT_IMAGE_JPEG_QUALITY))
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('El archivo elegido no se pudo leer como imagen.'))
    }

    image.src = objectUrl
  })
