/**
 * Archivo del proyecto Sweet Love.
 * Propósito: contiene la lógica correspondiente al módulo indicado por su nombre.
 * Los comentarios y nombres de funciones mantienen la intención del código en español.
 */
// Configura colores de ejes, leyendas y cuadrícula de ApexCharts según el tema.
export const useChartTheme = () => {
  const { isDark } = useThemeMode()

  const chartTheme = computed(() => ({
    foreColor: isDark.value ? '#B8BDB8' : '#5D6B5E',
    gridColor: isDark.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(108, 141, 111, 0.15)',
    tooltipTheme: isDark.value ? 'dark' : 'light',
  }))

  return { chartTheme }
}
