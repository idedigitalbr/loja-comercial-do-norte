export type BalloonSide = 'top' | 'bottom' | 'left' | 'right' | 'auto';

export interface NortTourStep {
  id: string;
  selector: string;
  mobileSelector?: string;
  title: string;
  message: string;
  badge?: string;
  mascotPose: string;
  mascotAlt: string;
  balloonSide?: BalloonSide;
  highlightPadding?: number;
  highlightRadius?: number;
}

export interface NortTourContextType {
  isOpen: boolean;
  currentStepIndex: number;
  currentStep: NortTourStep | null;
  totalSteps: number;
  hasSeenTour: boolean;
  promptDismissed: boolean;
  startTour: (stepIndex?: unknown) => void;
  endTour: (markAsSeen?: boolean) => void;
  closeTour: () => void;
  skipTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  dismissPrompt: () => void;
  resetTour: () => void;
}
