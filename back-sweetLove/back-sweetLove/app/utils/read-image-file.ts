import { PRODUCT_IMAGE_JPEG_QUALITY, PRODUCT_IMAGE_MAX_DIMENSION_PX } from '~/lib/constants'

// Reads an image file and returns a downscaled JPEG data URL so it can be
// persisted in localStorage without exhausting the storage quota.
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
        reject(new Error('Could not create a canvas context to process the image.'))
        return
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', PRODUCT_IMAGE_JPEG_QUALITY))
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('The selected file could not be read as an image.'))
    }

    image.src = objectUrl
  })
