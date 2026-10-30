/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NortHeader } from './nort-header';

describe('NortHeader - 4-second hover insistence', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('inicia fechado e não exibe o balão no primeiro segundo de hover', () => {
    render(<NortHeader />);
    expect(screen.queryByText(/Oi! Eu sou o Nort!/i)).toBeNull();

    const trigger = screen.getByRole('button', { name: /Conversar com o Nort/i });
    const root = trigger.parentElement!;

    // Hover com o mouse
    fireEvent.pointerEnter(root, { pointerType: 'mouse' });

    // Avança 2 segundos (menos que os 4s necessários)
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.queryByText(/Oi! Eu sou o Nort!/i)).toBeNull();
  });

  it('cancela a abertura se o usuário retirar o cursor antes dos 4 segundos', () => {
    render(<NortHeader />);
    const trigger = screen.getByRole('button', { name: /Conversar com o Nort/i });
    const root = trigger.parentElement!;

    // Entra com o mouse
    fireEvent.pointerEnter(root, { pointerType: 'mouse' });

    // Espera 3 segundos
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.queryByText(/Oi! Eu sou o Nort!/i)).toBeNull();

    // Sai antes de completar 4 segundos
    fireEvent.pointerLeave(root);

    // Avança mais 5 segundos
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Balão nunca deve abrir
    expect(screen.queryByText(/Oi! Eu sou o Nort!/i)).toBeNull();
  });

  it('abre o balão somente quando o usuário insiste com o hover por 4 segundos', () => {
    render(<NortHeader />);
    const trigger = screen.getByRole('button', { name: /Conversar com o Nort/i });
    const root = trigger.parentElement!;

    fireEvent.pointerEnter(root, { pointerType: 'mouse' });

    // 3.9 segundos: ainda fechado
    act(() => {
      vi.advanceTimersByTime(3900);
    });
    expect(screen.queryByText(/Oi! Eu sou o Nort!/i)).toBeNull();

    // Completa os 4 segundos
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Agora sim o balão aparece!
    expect(screen.getByText(/Oi! Eu sou o Nort!/i)).toBeDefined();
    expect(screen.getByText(/Como posso te ajudar\?/i)).toBeDefined();
    expect(screen.getByText(/Ver tour guiado novamente/i)).toBeDefined();
    expect(screen.getByText(/Falar com o Nort/i)).toBeDefined();
  });

  it('permite abrir imediatamente no clique direto', () => {
    render(<NortHeader />);
    const trigger = screen.getByRole('button', { name: /Conversar com o Nort/i });

    fireEvent.click(trigger);

    expect(screen.getByText(/Oi! Eu sou o Nort!/i)).toBeDefined();
  });

  it('fecha o balão ao clicar no botão X ou ao sair com o ponteiro', () => {
    render(<NortHeader />);
    const trigger = screen.getByRole('button', { name: /Conversar com o Nort/i });
    const root = trigger.parentElement!;

    // Abre com clique
    fireEvent.click(trigger);
    expect(screen.getByText(/Oi! Eu sou o Nort!/i)).toBeDefined();

    // Fecha com o botão X
    const closeBtn = screen.getByRole('button', { name: /Fechar ajuda do Nort/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByText(/Oi! Eu sou o Nort!/i)).toBeNull();
  });
});
