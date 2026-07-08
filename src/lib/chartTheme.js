/**
 * Centralized chart theme tokens.
 * Import getChartTheme(resolvedTheme) wherever a recharts chart lives
 * so all charts stay consistent when the app theme changes.
 */
export const CHART_THEMES = {
  dark: {
    axisLabel: '#A1A1AA',
    tickLabel: '#71717A',
    gridLine: 'rgba(255,255,255,0.12)',
    angleLine: 'rgba(255,255,255,0.10)',
    radarFill: 'rgba(99,102,241,0.20)',
    radarBorder: '#6366F1',
    pointFill: '#6366F1',
    tooltipBg: '#111827',
    tooltipText: '#FFFFFF',
    tooltipBorder: 'transparent',
  },
  light: {
    axisLabel: '#374151',
    tickLabel: '#4B5563',
    gridLine: 'rgba(0,0,0,0.12)',
    angleLine: 'rgba(0,0,0,0.10)',
    radarFill: 'rgba(79,70,229,0.15)',
    radarBorder: '#4F46E5',
    pointFill: '#4F46E5',
    tooltipBg: '#FFFFFF',
    tooltipText: '#111827',
    tooltipBorder: '#E5E7EB',
  },
};

export function getChartTheme(resolvedTheme) {
  return resolvedTheme === 'light' ? CHART_THEMES.light : CHART_THEMES.dark;
}