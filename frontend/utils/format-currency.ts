/** format-currency.ts — formato de dinero en pesos colombianos. */
const COP_FORMATTER = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

/**
 * Da formato de pesos colombianos a un monto.
 * @param {number} value Monto.
 * @returns {string} Texto como "$ 45.000".
 */
export const formatCop = (value: number) => COP_FORMATTER.format(value)
