import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PromotionsPage } from './promotions-page';

const coupon = {
  id: 'coupon-1',
  code: 'VIP20',
  description: 'Clientes VIP',
  status: 'ACTIVE',
  discountType: 'PERCENTAGE',
  discountValue: 20,
  allowFreeShipping: true,
  individualUse: true,
  excludeSaleItems: true,
  usageCount: 2,
  usageLimit: 100,
  perCustomerLimit: 1,
  minimumSubtotalCents: 10000,
  maximumSubtotalCents: 50000,
  maxEligibleItems: 3,
  startsAt: '2026-09-01T00:00:00.000Z',
  endsAt: null,
  productRules: [],
  categoryRules: [],
  emailRestrictions: [{ pattern: '*@gmail.com' }],
};

describe('PromotionsPage', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renders the WooCommerce-style coupon tabs and existing advanced rules', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [coupon] }));
    render(<PromotionsPage />);

    expect(await screen.findByRole('heading', { name: 'Promoções' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Geral' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Restrição de uso' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Limites de uso' })).toBeInTheDocument();
    expect(await screen.findByText('VIP20')).toBeInTheDocument();
    expect(screen.getByText('Desconto de porcentagem')).toBeInTheDocument();

    await userEvent.setup().click(screen.getByRole('tab', { name: 'Restrição de uso' }));
    expect(screen.getByLabelText('Produtos incluídos')).toBeInTheDocument();
    expect(screen.getByLabelText('Padrões de e-mail')).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('tab', { name: 'Limites de uso' }));
    expect(screen.getByLabelText('Limite de uso por cupom')).toBeInTheDocument();
  });

  it('submits all advanced rule groups in one coupon payload', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'coupon-2' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(<PromotionsPage />);

    await user.type(await screen.findByLabelText('Código do cupom'), 'vip10');
    await user.type(screen.getByLabelText('Valor do desconto'), '10');
    await user.click(screen.getByRole('tab', { name: 'Restrição de uso' }));
    fireEvent.change(screen.getByLabelText('Produtos incluídos'), { target: { value: 'product-1, product-2' } });
    fireEvent.change(screen.getByLabelText('Padrões de e-mail'), { target: { value: '*@gmail.com' } });
    await user.click(screen.getByRole('tab', { name: 'Limites de uso' }));
    await user.type(screen.getByLabelText('Limite de uso por cupom'), '25');
    await user.click(screen.getByRole('button', { name: 'Criar cupom' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    const request = JSON.parse(String(fetchMock.mock.calls[1][1]?.body));
    expect(request).toMatchObject({
      code: 'VIP10',
      discountType: 'FIXED_CART',
      discountValue: 1000,
      productIds: ['product-1', 'product-2'],
      emailPatterns: ['*@gmail.com'],
      usageLimit: 25,
    });
  });
});
