/**
 * Archivo del proyecto Sweet Love.
 * Propósito: contiene la lógica correspondiente al módulo indicado por su nombre.
 * Los comentarios y nombres de funciones mantienen la intención del código en español.
 */
// Client-side CSV download; semicolon separator opens correctly in Excel (es locale).
export const downloadCsv = (filename: string, rows: (string | number)[][]) => {
  const escapeCell = (cell: string | number) => `"${String(cell).replaceAll('"', '""')}"`
  const content = rows.map((row) => row.map(escapeCell).join(';')).join('\r\n')
  const blob = new Blob([`﻿${content}`], { type: 'text/csv;charset=utf-8;' })
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(objectUrl)
}
