import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WebBadge } from './web-badge';
import { WebButton } from './web-button';
import { WebEmptyState } from './web-empty-state';
import { cn } from './cn';

describe('design system web (tokens oficiais)', () => {
  it('aplica variante e tamanho do botão', () => {
    render(<WebButton size="lg" variant="promo">Enviar cotação</WebButton>);
    const button = screen.getByRole('button', { name: 'Enviar cotação' });
    expect(button.className).toContain('bg-promo');
    expect(button.className).toContain('px-5');
  });

  it('desabilita e sinaliza carregamento', () => {
    render(<WebButton loading>Enviar</WebButton>);
    const button = screen.getByRole('button', { name: /Enviar/ });
    expect(button).toBeDisabled();
    expect(button.getAttribute('aria-busy')).toBe('true');
  });

  it('resolve conflito de classes com tailwind-merge', () => {
    expect(cn('px-2 text-sm', 'px-4')).toBe('text-sm px-4');
  });

  it('renderiza etiqueta com tom', () => {
    render(<WebBadge tone="promo">-12%</WebBadge>);
    expect(screen.getByText('-12%').className).toContain('bg-promo-soft');
  });

  it('renderiza estado vazio com ação', () => {
    render(<WebEmptyState action={<a href="/loja">Ver catálogo</a>} description="Adicione produtos" title="Cotação vazia" />);
    expect(screen.getByText('Cotação vazia')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Ver catálogo' })).toBeTruthy();
  });
});
