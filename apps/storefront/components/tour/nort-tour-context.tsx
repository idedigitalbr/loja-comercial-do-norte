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
      setHasSeenTour(false);
      startTour(0);
    } catch {}
  }, [startTour]);

  // Ao montar no cliente: se for a primeira visita do usuário, inicia o tour imediatamente!
  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY_SEEN);
      if (seen !== 'true') {
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
