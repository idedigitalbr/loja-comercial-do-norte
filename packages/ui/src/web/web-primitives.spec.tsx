import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { cn, WebBadge, WebButton, WebEmptyState } from './index';

describe('packages/ui web primitives (C2)', () => {
  it('cn combina classes condicionais e resolve conflitos do Tailwind', () => {
    expect(cn('px-2 py-1', false && 'hidden', 'px-4')).toBe('py-1 px-4');
  });

  it('WebButton renderiza variantes, loading acessivel e nunca exibe Comprar por padrao', () => {
    const html = renderToStaticMarkup(
      <WebButton fullWidth loading variant="promo">
        Adicionar à cotação
      </WebButton>,
    );
    expect(html).toContain('Adicionar à cotação');
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('disabled=""');
    expect(html).toContain('Processando');
  });

  it('WebBadge aplica tons oficiais da marca', () => {
    const html = renderToStaticMarkup(<WebBadge tone="promo">35% OFF</WebBadge>);
    expect(html).toContain('35% OFF');
    expect(html).toContain('bg-promo-soft');
  });

  it('WebEmptyState renderiza titulo, descricao e acao', () => {
    const html = renderToStaticMarkup(
      <WebEmptyState
        action={<a href="/loja">Ver catálogo</a>}
        description="Ajuste os filtros de busca."
        title="Nenhum produto encontrado"
      />,
    );
    expect(html).toContain('Nenhum produto encontrado');
    expect(html).toContain('Ajuste os filtros de busca.');
    expect(html).toContain('Ver catálogo');
  });
});
