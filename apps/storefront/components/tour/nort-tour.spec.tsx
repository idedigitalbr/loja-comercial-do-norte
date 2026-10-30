/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';
import { NortTourProvider, useNortTour } from './nort-tour-context';
import { NortTourCard } from './nort-tour-card';
import { NORT_TOUR_STEPS } from './nort-tour-steps';
import { NortHeader } from '../nort-header';

// Mock do next/image para renderizar img comum em testes
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    const { fill, priority, ...rest } = props;
    return <img {...rest} />;
  },
}));

function TestConsumer() {
  const { startTour, isOpen, currentStepIndex, totalSteps, closeTour } = useNortTour();
  return (
    <div>
      <button onClick={() => startTour(0)}>Iniciar Tour</button>
      <button onClick={closeTour}>Fechar Tour</button>
      <span data-testid="status">{isOpen ? 'aberto' : 'fechado'}</span>
      <span data-testid="step-index">{currentStepIndex}</span>
      <span data-testid="total-steps">{totalSteps}</span>
    </div>
  );
}

describe('Nort Guided Tour Engine', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('inicia com tour fechado e permite iniciar via startTour()', () => {
    render(
      <NortTourProvider>
        <TestConsumer />
      </NortTourProvider>
    );

    expect(screen.getByTestId('status').textContent).toBe('fechado');

    fireEvent.click(screen.getByText('Iniciar Tour'));

    expect(screen.getByTestId('status').textContent).toBe('aberto');
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('renderiza o balão de fala com o mascote Nort, fala oficial e badge de boas-vindas no passo 1', () => {
    render(
      <NortTourCard
        step={NORT_TOUR_STEPS[0]}
        currentStepIndex={0}
        totalSteps={NORT_TOUR_STEPS.length}
        onNext={vi.fn()}
        onPrev={vi.fn()}
        onClose={vi.fn()}
        onStepClick={vi.fn()}
      />
    );

    // Verifica a presença do mascote com alt descritivo
    const mascot = screen.getByAltText('Mascote Nort de braços abertos dando boas-vindas');
    expect(mascot).toBeTruthy();

    // Verifica a tag "Nort Apresenta" e o badge do passo
    expect(screen.getByText('Nort Apresenta')).toBeTruthy();
    expect(screen.getByText('Boas-vindas')).toBeTruthy();

    // Verifica a fala em 1ª pessoa saindo da boca do mascote
    expect(screen.getByText('Oi! Eu sou o Nort! 👋')).toBeTruthy();
    expect(
      screen.getByText(/Seja muito bem-vindo à Loja Comercial do Norte!/i)
    ).toBeTruthy();

    // No primeiro passo, não deve haver botão "Voltar"
    expect(screen.queryByText('Voltar')).toBeNull();
    expect(screen.getByText('Próximo')).toBeTruthy();
  });

  it('avança para o passo seguinte e exibe o botão Voltar', () => {
    render(
      <NortTourProvider>
        <TestConsumer />
      </NortTourProvider>
    );

    fireEvent.click(screen.getByText('Iniciar Tour'));

    // Passo 1 ativo
    expect(screen.getByText('Oi! Eu sou o Nort! 👋')).toBeTruthy();

    // Clica em Próximo
    fireEvent.click(screen.getByText('Próximo'));

    // Passo 2 (Busca rápida)
    expect(screen.getByText('Busca Rápida de Produtos 🔍')).toBeTruthy();
    expect(screen.getByText('Voltar')).toBeTruthy();
  });

  it('permite pular e fechar o tour a qualquer momento', () => {
    render(
      <NortTourProvider>
        <TestConsumer />
      </NortTourProvider>
    );

    fireEvent.click(screen.getByText('Iniciar Tour'));
    expect(screen.getByRole('dialog')).toBeTruthy();

    fireEvent.click(screen.getByText('Pular tour'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('integração com NortHeader: clicar em "Ver tour guiado novamente" inicia o tour', () => {
    render(
      <NortTourProvider>
        <NortHeader />
      </NortTourProvider>
    );

    // Abre o balão do Nort no cabeçalho clicando no trigger
    const nortButton = screen.getByRole('button', { name: /Conversar com o Nort/i });
    fireEvent.click(nortButton);

    // Clica no botão "Ver tour guiado novamente"
    const tourButton = screen.getByRole('button', { name: /Ver tour guiado novamente/i });
    expect(tourButton).toBeTruthy();

    fireEvent.click(tourButton);

    // O tour deve abrir imediatamente
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('Oi! Eu sou o Nort! 👋')).toBeTruthy();
  });
});
