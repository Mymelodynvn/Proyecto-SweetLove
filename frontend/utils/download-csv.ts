// download-csv.ts — descarga de archivos CSV desde el navegador
// Client-side CSV download; semicolon separator opens correctly in Excel (es locale).
// Genera un CSV y lo descarga, recibe filename, rows
export const downloadCsv = (filename: string, rows: (string | number)[][]) => {
  // Encierra una celda entre comillas y duplica las comillas internas
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
