'use client';

import { useEffect } from 'react';
import { classifyWebVital, type WebVitalMetric } from '@/lib/web-vitals';

declare global {
  interface Window {
    __cnWebVitals?: Array<WebVitalMetric & { rating: string; recordedAt: string }>;
  }
}

export function recordWebVitalMetric(metric: WebVitalMetric) {
  if (typeof window === 'undefined') return;
  const rating = metric.rating ?? classifyWebVital(metric.name, metric.value);
  const entry = {
    ...metric,
    rating,
    recordedAt: new Date().toISOString(),
  };
  window.__cnWebVitals = [...(window.__cnWebVitals ?? []).slice(-19), entry];
}

export function WebVitalsReporter() {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') return;

    const observers: PerformanceObserver[] = [];

    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const last = entries[entries.length - 1];
        if (last) {
          recordWebVitalMetric({
            id: `lcp-${Math.round(last.startTime)}`,
            name: 'LCP',
            value: Math.round(last.startTime),
          });
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      observers.push(lcpObserver);
    } catch {
      // Navegador não suporta largest-contentful-paint
    }

    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries() as Array<PerformanceEntry & { hadRecentInput?: boolean; value?: number }>) {
          if (!entry.hadRecentInput && typeof entry.value === 'number') {
            clsValue += entry.value;
          }
        }
        recordWebVitalMetric({
          id: 'cls-session',
          name: 'CLS',
          value: Number(clsValue.toFixed(4)),
        });
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      observers.push(clsObserver);
    } catch {
      // Navegador não suporta layout-shift
    }

    return () => {
      for (const observer of observers) observer.disconnect();
    };
  }, []);

  return null;
}
