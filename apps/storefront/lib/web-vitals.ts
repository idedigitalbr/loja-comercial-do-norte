export type WebVitalName = 'LCP' | 'CLS' | 'INP' | 'FCP' | 'TTFB';
export type WebVitalRating = 'good' | 'needs-improvement' | 'poor';

export type WebVitalMetric = {
  id: string;
  name: WebVitalName | string;
  value: number;
  rating?: WebVitalRating;
};

/**
 * Limiares oficiais de Core Web Vitals (Google Web Vitals):
 * - LCP <= 2500ms (good), <= 4000ms (needs-improvement)
 * - CLS <= 0.1 (good), <= 0.25 (needs-improvement)
 * - INP <= 200ms (good), <= 500ms (needs-improvement)
 * - FCP <= 1800ms (good), <= 3000ms (needs-improvement)
 * - TTFB <= 800ms (good), <= 1800ms (needs-improvement)
 */
export const WEB_VITALS_THRESHOLDS: Record<WebVitalName, { good: number; poor: number }> = {
  LCP: { good: 2500, poor: 4000 },
  CLS: { good: 0.1, poor: 0.25 },
  INP: { good: 200, poor: 500 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
};

export function classifyWebVital(name: string, value: number): WebVitalRating {
  const threshold = WEB_VITALS_THRESHOLDS[name as WebVitalName];
  if (!threshold) return 'good';
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Calcula o atributo `sizes` responsivo recomendado para grades de imagens do catálogo.
 */
export function responsiveGridSizes(columns: { mobile?: number; tablet?: number; desktop: number }): string {
  const mobileVw = Math.round(100 / (columns.mobile ?? 1));
  const tabletVw = Math.round(100 / (columns.tablet ?? 2));
  const desktopPx = Math.round(1280 / columns.desktop);
  return `(max-width: 640px) ${mobileVw}vw, (max-width: 1024px) ${tabletVw}vw, ${desktopPx}px`;
}
