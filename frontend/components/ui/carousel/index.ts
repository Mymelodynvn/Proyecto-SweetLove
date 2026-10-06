/**
 * Archivo del proyecto Sweet Love.
 * Propósito: contiene la lógica correspondiente al módulo indicado por su nombre.
 * Los comentarios y nombres de funciones mantienen la intención del código en español.
 */
export { default as Carousel } from './Carousel.vue'
export { default as CarouselContent } from './CarouselContent.vue'
export { default as CarouselItem } from './CarouselItem.vue'
export { default as CarouselNext } from './CarouselNext.vue'
export { default as CarouselPrevious } from './CarouselPrevious.vue'
export type {
  UnwrapRefCarouselApi as CarouselApi,
} from './interface'

export { useCarousel } from './useCarousel'
