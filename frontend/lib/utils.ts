/** utils.ts — utilidades de estilos (usada por los componentes shadcn). */
import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina clases CSS condicionales y resuelve conflictos de Tailwind.
 * @param inputs Clases, objetos o listas de clases.
 * @returns {string} Cadena de clases final.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
