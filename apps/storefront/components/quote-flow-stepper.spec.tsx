/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { QuoteFlowStepper } from './quote-flow-stepper';

afterEach(cleanup);

describe('QuoteFlowStepper', () => {
  it('renderiza as 3 etapas em uma lista semântica e destaca a etapa 2 em /cotacao', () => {
    render(<QuoteFlowStepper currentStep={2} itemsCount={3} />);

    const list = screen.getByRole('list', { name: /Etapas da cotação/i });
    expect(list.className).toContain('md:flex-row');

    const listItems = Array.from(list.children);
    expect(listItems).toHaveLength(3);
    expect(listItems.every((el) => el.tagName === 'LI')).toBe(true);

    expect(screen.getByText('Itens (3)')).toBeInTheDocument();
    expect(screen.getByText('Loja & Contato')).toBeInTheDocument();
    expect(screen.getByText('Proposta Comercial')).toBeInTheDocument();

    expect(listItems[1]).toHaveAttribute('aria-current', 'step');
    expect(listItems[0]).not.toHaveAttribute('aria-current');
    expect(listItems[2]).not.toHaveAttribute('aria-current');
  });

  it('destaca a etapa 3 como em análise na página de confirmação', () => {
    render(<QuoteFlowStepper currentStep={3} itemsCount={2} />);

    const list = screen.getByRole('list', { name: /Etapas da cotação/i });
    const listItems = Array.from(list.children);

    expect(screen.getByText('Itens (2)')).toBeInTheDocument();
    expect(screen.getByText('Em análise')).toBeInTheDocument();
    expect(listItems[2]).toHaveAttribute('aria-current', 'step');
  });
});
