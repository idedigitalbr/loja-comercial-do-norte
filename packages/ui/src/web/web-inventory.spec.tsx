import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import {
  WebAlert,
  WebCard,
  WebField,
  WebInput,
  WebSelect,
  WebSheet,
  WebSkeleton,
  WebTextarea,
} from './web-inventory';

afterEach(cleanup);

describe('inventario de componentes web com estados e acessibilidade (C3)', () => {
  it('renderiza WebField e WebInput com label associada e erro anunciado via role=alert', () => {
    render(
      <WebField error="Informe seu WhatsApp" id="whatsapp" label="WhatsApp" required>
        <WebInput aria-describedby="whatsapp-error" id="whatsapp" invalid />
      </WebField>,
    );
    const input = screen.getByLabelText(/WhatsApp/);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Informe seu WhatsApp');
  });

  it('renderiza WebTextarea e WebSelect com estados de desabilitado e invalido', () => {
    render(
      <div>
        <WebTextarea aria-label="Observações" disabled />
        <WebSelect aria-label="Ordenação" invalid>
          <option value="newest">Mais recentes</option>
        </WebSelect>
      </div>,
    );
    expect(screen.getByLabelText('Observações')).toBeDisabled();
    expect(screen.getByLabelText('Ordenação')).toHaveAttribute('aria-invalid', 'true');
  });

  it('renderiza WebAlert com role adequado para erro e status', () => {
    const { rerender } = render(
      <WebAlert title="Atenção" tone="error">
        Falha ao enviar cotação
      </WebAlert>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Falha ao enviar cotação');

    rerender(<WebAlert tone="success">Cotação recebida</WebAlert>);
    expect(screen.getByRole('status')).toHaveTextContent('Cotação recebida');
  });

  it('renderiza WebCard e WebSkeleton com aria-hidden no skeleton', () => {
    const { container } = render(
      <WebCard>
        <WebSkeleton className="h-6 w-32" />
      </WebCard>,
    );
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
  });

  it('renderiza WebSheet acessivel com aria-modal e fecha com Escape', () => {
    const onClose = vi.fn();
    render(
      <WebSheet eyebrow="Sua lista" onClose={onClose} open title="Carrinho de cotação">
        <p>2 itens</p>
      </WebSheet>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Carrinho de cotação' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
