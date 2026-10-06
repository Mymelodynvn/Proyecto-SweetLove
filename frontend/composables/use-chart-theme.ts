/**
 * use-chart-theme.ts — colores de las gráficas.
 * Adapta ejes, cuadrícula y tooltip de ApexCharts al tema claro u oscuro activo.
 */
// Configura colores de ejes, leyendas y cuadrícula de ApexCharts según el tema.
/**
 * Devuelve la configuración de colores de gráficas, que cambia reactivamente con el tema.
 * @returns Objeto `chartTheme` con foreColor, gridColor y tooltipTheme.
 */
export const useChartTheme = () => {
  const { isDark } = useThemeMode()

  const chartTheme = computed(() => ({
    foreColor: isDark.value ? '#B8BDB8' : '#5D6B5E',
    gridColor: isDark.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(108, 141, 111, 0.15)',
    tooltipTheme: isDark.value ? 'dark' : 'light',
  }))

  return { chartTheme }
}
