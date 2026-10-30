/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';
import {
  NortTourProvider,
  useNortTour,
  checkAndRecordAutoOpen,
  STORAGE_KEY_FREQ,
} from './nort-tour-context';
import { NortTourCard } from './nort-tour-card';
import { NORT_TOUR_STEPS } from './nort-tour-steps';
import { NortHeader } from '../nort-header';

// Mock do next/image para renderizar img comum em testes
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    const { fill, priority, unoptimized, ...rest } = props;
    return <img {...rest} />;
  },
}));

function TestConsumer() {
  const { startTour, isOpen, currentStepIndex, totalSteps, closeTour } = useNortTour();
  return (
    <div>
      <button onClick={() => startTour()}>Iniciar Tour</button>
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

  it('cumpre a regra de frequência: abre 2x ao dia apenas nos primeiros 2 dias de visita', () => {
    const day1 = new Date(2026, 9, 30, 10, 0, 0); // 2026-10-30
    const day2 = new Date(2026, 9, 31, 10, 0, 0); // 2026-10-31
    const day3 = new Date(2026, 10, 1, 10, 0, 0); // 2026-11-01

    // DIA 1: 1ª abertura
    expect(checkAndRecordAutoOpen(window.localStorage, day1)).toBe(true);
    let record = JSON.parse(window.localStorage.getItem(STORAGE_KEY_FREQ) || '{}');
    expect(record.days['2026-10-30']).toBe(1);

    // DIA 1: 2ª abertura
    expect(checkAndRecordAutoOpen(window.localStorage, day1)).toBe(true);
    record = JSON.parse(window.localStorage.getItem(STORAGE_KEY_FREQ) || '{}');
    expect(record.days['2026-10-30']).toBe(2);

    // DIA 1: 3ª carga de página (limite de 2x ao dia atingido) -> NÃO abre
    expect(checkAndRecordAutoOpen(window.localStorage, day1)).toBe(false);
    record = JSON.parse(window.localStorage.getItem(STORAGE_KEY_FREQ) || '{}');
    expect(record.days['2026-10-30']).toBe(2);

    // DIA 2: 1ª abertura
    expect(checkAndRecordAutoOpen(window.localStorage, day2)).toBe(true);
    record = JSON.parse(window.localStorage.getItem(STORAGE_KEY_FREQ) || '{}');
    expect(record.days['2026-10-31']).toBe(1);

    // DIA 2: 2ª abertura
    expect(checkAndRecordAutoOpen(window.localStorage, day2)).toBe(true);
    record = JSON.parse(window.localStorage.getItem(STORAGE_KEY_FREQ) || '{}');
    expect(record.days['2026-10-31']).toBe(2);

    // DIA 2: 3ª carga de página -> NÃO abre
    expect(checkAndRecordAutoOpen(window.localStorage, day2)).toBe(false);

    // DIA 3: usuário retorna no 3º dia -> NÃO abre mais automaticamente
    expect(checkAndRecordAutoOpen(window.localStorage, day3)).toBe(false);

    // DIA 4+: dias futuros continuam não abrindo automaticamente
    const day4 = new Date(2026, 10, 5, 10, 0, 0);
    expect(checkAndRecordAutoOpen(window.localStorage, day4)).toBe(false);
  });

  it('inicia o tour automaticamente no carregamento da página para novos visitantes', () => {
    vi.useFakeTimers();

    // Novo visitante: ainda não completou o tour
    window.localStorage.removeItem('cn_nort_tour_completed_v1');

    render(
      <NortTourProvider>
        <div>conteúdo da página</div>
      </NortTourProvider>
    );

    // Avança o micro-timer de inicialização (80ms)
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // O tour DEVE abrir imediatamente em tela cheia com o Nort
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('Opa! Seja muito bem-vindo à Comercial do Norte! 👋')).toBeTruthy();

    vi.useRealTimers();
  });

  it('renderiza o balão de fala com o mascote Nort grande e badge de boas-vindas no passo 1', () => {
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
    expect(screen.getByText('Opa! Seja muito bem-vindo à Comercial do Norte! 👋')).toBeTruthy();
    expect(
      screen.getByText(/Eu sou o Nort, o mascote da loja! Somos o comercial da pizzaria, do lancheiro e de quem empreende/i)
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
    expect(screen.getByText('Opa! Seja muito bem-vindo à Comercial do Norte! 👋')).toBeTruthy();

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

  it('integração com NortHeader: clicar em "Ver tour guiado novamente" inicia o tour mesmo se cota automática expirou', () => {
    // Simula que a cota automática dos 2 dias já expirou
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    window.localStorage.setItem(
      STORAGE_KEY_FREQ,
      JSON.stringify({ days: { [dateStr]: 2, '2026-01-01': 2 } })
    );

    render(
      <NortTourProvider>
        <NortHeader />
      </NortTourProvider>
    );

    // O tour NÃO deve estar aberto automaticamente pois a cota foi atingida
    expect(screen.queryByRole('dialog')).toBeNull();

    // Abre o balão do Nort no cabeçalho clicando no trigger
    const nortButton = screen.getByRole('button', { name: /Conversar com o Nort/i });
    fireEvent.click(nortButton);

    // Clica no botão "Ver tour guiado novamente"
    const tourButton = screen.getByRole('button', { name: /Ver tour guiado novamente/i });
    expect(tourButton).toBeTruthy();

    fireEvent.click(tourButton);

    // O tour deve abrir imediatamente sob comando manual
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('Opa! Seja muito bem-vindo à Comercial do Norte! 👋')).toBeTruthy();
  });
});
