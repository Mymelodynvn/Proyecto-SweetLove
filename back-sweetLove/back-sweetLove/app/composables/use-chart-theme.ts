// Shared ApexCharts theming: legible axis/legend text and grid lines per theme.
export const useChartTheme = () => {
  const { isDark } = useThemeMode()

  const chartTheme = computed(() => ({
    foreColor: isDark.value ? '#B8BDB8' : '#5D6B5E',
    gridColor: isDark.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(108, 141, 111, 0.15)',
    tooltipTheme: isDark.value ? 'dark' : 'light',
  }))

  return { chartTheme }
}
