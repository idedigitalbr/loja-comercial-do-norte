'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { NORT_TOUR_STEPS } from './nort-tour-steps';
import { NortTourOverlay } from './nort-tour-overlay';
import type { NortTourContextType, NortTourStep } from './nort-tour-types';

const STORAGE_KEY_SEEN = 'cn_nort_tour_completed_v1';
export const STORAGE_KEY_FREQ = 'cn_nort_tour_freq_v1';

export const MAX_TOUR_DAYS = 2;
export const MAX_OPENS_PER_DAY = 2;

export interface NortTourFrequencyRecord {
  days: Record<string, number>;
}

export function getTodayDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Avalia se o tour guiado deve ser aberto automaticamente:
 * - Abre no máximo 2 vezes ao dia (1ª e 2ª carga de página daquele dia).
 * - Repete esse comportamento apenas nos primeiros 2 dias de visita do usuário.
 * - A partir do 3º dia em diante (ou na 3ª carga de página de cada um dos 2 dias),
 *   não abre mais automaticamente.
 * - Retorna true se deve abrir (e já incrementa e salva a contagem), false caso contrário.
 */
export function checkAndRecordAutoOpen(
  storage: Storage | null = typeof window !== 'undefined' ? window.localStorage : null,
  now: Date = new Date()
): boolean {
  if (!storage) return false;

  try {
    const raw = storage.getItem(STORAGE_KEY_FREQ);
    let record: NortTourFrequencyRecord = { days: {} };
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (
          parsed &&
          typeof parsed === 'object' &&
          parsed.days &&
          typeof parsed.days === 'object'
        ) {
          record = parsed;
        }
      } catch {
        record = { days: {} };
      }
    }

    const today = getTodayDateString(now);
    const recordedDays = Object.keys(record.days);
    const hasToday = Object.prototype.hasOwnProperty.call(record.days, today);

    // Se a data de hoje ainda não foi registrada e já existem MAX_TOUR_DAYS registrados anteriormente,
    // o período de 2 dias do usuário já foi encerrado.
    if (!hasToday && recordedDays.length >= MAX_TOUR_DAYS) {
      return false;
    }

    const todayCount = record.days[today] ?? 0;
    // Se hoje já atingiu a cota diária de MAX_OPENS_PER_DAY aberturas automáticas
    if (todayCount >= MAX_OPENS_PER_DAY) {
      return false;
    }

    // Registra a nova abertura automática de hoje e persiste no localStorage
    record.days[today] = todayCount + 1;
    storage.setItem(STORAGE_KEY_FREQ, JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}

const defaultNortTourContext: NortTourContextType = {
  isOpen: false,
  currentStepIndex: 0,
  currentStep: null,
  totalSteps: NORT_TOUR_STEPS.length,
  hasSeenTour: false,
  promptDismissed: true,
  startTour: () => {},
  endTour: () => {},
  closeTour: () => {},
  skipTour: () => {},
  nextStep: () => {},
  prevStep: () => {},
  goToStep: () => {},
  dismissPrompt: () => {},
  resetTour: () => {},
};

const NortTourContext = createContext<NortTourContextType | null>(null);

export function NortTourProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(true); // default true para evitar hydration mismatch no SSR

  const startTour = useCallback((startIndex?: unknown) => {
    const validIndex =
      typeof startIndex === 'number' && !Number.isNaN(startIndex)
        ? Math.floor(startIndex)
        : 0;
    const clampedIndex = Math.max(0, Math.min(validIndex, NORT_TOUR_STEPS.length - 1));
    setCurrentStepIndex(clampedIndex);
    setIsOpen(true);
  }, []);

  const endTour = useCallback((markAsSeen = true) => {
    setIsOpen(false);
    if (markAsSeen) {
      try {
        localStorage.setItem(STORAGE_KEY_SEEN, 'true');
        setHasSeenTour(true);
      } catch {}
    }
  }, []);

  const closeTour = useCallback(() => {
    setIsOpen(false);
  }, []);

  const skipTour = useCallback(() => {
    endTour(true);
  }, [endTour]);

  const nextStep = useCallback(() => {
    setCurrentStepIndex((prev) => {
      if (prev < NORT_TOUR_STEPS.length - 1) {
        return prev + 1;
      }
      endTour(true);
      return prev;
    });
  }, [endTour]);

  const prevStep = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < NORT_TOUR_STEPS.length) {
      setCurrentStepIndex(index);
    }
  }, []);

  const dismissPrompt = useCallback(() => {
    // Mantido por compatibilidade de tipo
  }, []);

  const resetTour = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY_SEEN);
      localStorage.removeItem(STORAGE_KEY_FREQ);
      setHasSeenTour(false);
      startTour(0);
    } catch {}
  }, [startTour]);

  // Ao montar no cliente: verifica se deve abrir automaticamente
  // (máximo 2 vezes ao dia durante os 2 primeiros dias do visitante)
  useEffect(() => {
    try {
      const shouldAutoOpen = checkAndRecordAutoOpen();
      if (shouldAutoOpen) {
        setHasSeenTour(false);
        const timer = setTimeout(() => {
          startTour(0);
        }, 80);
        return () => clearTimeout(timer);
      } else {
        setHasSeenTour(true);
      }
    } catch {
      // Ignora falhas em ambientes sem acesso ao storage
    }
  }, [startTour]);

  const currentStep: NortTourStep | null = isOpen ? (NORT_TOUR_STEPS[currentStepIndex] ?? null) : null;

  return (
    <NortTourContext.Provider
      value={{
        isOpen,
        currentStepIndex,
        currentStep,
        totalSteps: NORT_TOUR_STEPS.length,
        hasSeenTour,
        promptDismissed: true,
        startTour,
        endTour,
        closeTour,
        skipTour,
        nextStep,
        prevStep,
        goToStep,
        dismissPrompt,
        resetTour,
      }}
    >
      {children}

      {/* OVERLAY DO TOUR EM EXECUÇÃO */}
      {isOpen && currentStep && (
        <NortTourOverlay
          step={currentStep}
          currentStepIndex={currentStepIndex}
          totalSteps={NORT_TOUR_STEPS.length}
          onNext={nextStep}
          onPrev={prevStep}
          onClose={() => endTour(true)}
          onStepClick={goToStep}
        />
      )}
    </NortTourContext.Provider>
  );
}

export function useNortTour(): NortTourContextType {
  const context = useContext(NortTourContext);
  return context ?? defaultNortTourContext;
}
