'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { NortTourContextType, NortTourStep } from './nort-tour-types';
import { NORT_TOUR_STEPS } from './nort-tour-steps';
import { NortTourOverlay } from './nort-tour-overlay';
import { NortTourPrompt } from './nort-tour-prompt';

const STORAGE_KEY_SEEN = 'cn_nort_tour_completed_v1';
const STORAGE_KEY_PROMPT = 'cn_nort_tour_prompt_dismissed_v1';

const defaultNortTourContext: NortTourContextType = {
  isOpen: false,
  currentStepIndex: 0,
  currentStep: null,
  totalSteps: NORT_TOUR_STEPS.length,
  hasSeenTour: false,
  promptDismissed: false,
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

export function NortTourProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(true); // default true para SSR seguro
  const [promptDismissed, setPromptDismissed] = useState(true);

  // Inicializa estado a partir do LocalStorage no cliente
  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY_SEEN);
      const prompt = localStorage.getItem(STORAGE_KEY_PROMPT);
      setHasSeenTour(seen === 'true');
      setPromptDismissed(prompt === 'true');
    } catch {
      // Falhas silenciosas em ambientes privados/sem storage
    }
  }, []);

  const startTour = useCallback((startIndex = 0) => {
    setCurrentStepIndex(Math.max(0, Math.min(startIndex, NORT_TOUR_STEPS.length - 1)));
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
    if (currentStepIndex < NORT_TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      endTour(true);
    }
  }, [currentStepIndex, endTour]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < NORT_TOUR_STEPS.length) {
      setCurrentStepIndex(index);
    }
  }, []);

  const dismissPrompt = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROMPT, 'true');
      setPromptDismissed(true);
    } catch {}
  }, []);

  const resetTour = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY_SEEN);
      localStorage.removeItem(STORAGE_KEY_PROMPT);
      setHasSeenTour(false);
      setPromptDismissed(false);
      startTour(0);
    } catch {}
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
        promptDismissed,
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

      {/* OVERLAY NATIVO INTERATIVO COM MÁSCARA SVG E NORT 3D */}
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

      {/* CONVITE SUAVE PARA VISITANTES DE PRIMEIRA VIAGEM */}
      {!isOpen && !hasSeenTour && !promptDismissed && (
        <NortTourPrompt onStart={startTour} onDismiss={dismissPrompt} />
      )}
    </NortTourContext.Provider>
  );
}

export function useNortTour(): NortTourContextType {
  const context = useContext(NortTourContext);
  return context ?? defaultNortTourContext;
}
