/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NortHeader } from './nort-header';

describe('NortHeader Component (Visual Mascot without Balloon / Interaction)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('renderiza o mascote Nort com o ID oficial do tour e label acessível', () => {
    render(<NortHeader />);
    const mascot = screen.getByRole('img', { name: /Nort, mascote da Comercial do Norte/i });
    expect(mascot).toBeDefined();
    expect(mascot.id).toBe('tour-header-nort');
  });

  it('não renderiza balão de diálogo nem botões de interação', () => {
    render(<NortHeader />);
    expect(screen.queryByText(/Oi! Eu sou o Nort!/i)).toBeNull();
    expect(screen.queryByText(/Como posso te ajudar\?/i)).toBeNull();
    expect(screen.queryByText(/Ver tour guiado novamente/i)).toBeNull();
    expect(screen.queryByText(/Falar com o Nort/i)).toBeNull();
    expect(screen.queryByRole('button', { name: /Conversar com o Nort/i })).toBeNull();
  });

  it('exibe o container do personagem e sprite de animação', () => {
    const { container } = render(<NortHeader />);
    const sprite = container.querySelector('[class*="sprite"]');
    expect(sprite).not.toBeNull();
  });
});
