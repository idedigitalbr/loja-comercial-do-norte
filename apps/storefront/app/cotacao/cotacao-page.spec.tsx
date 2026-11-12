/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import QuoteFormPage from './page';
import { DEFAULT_LOCATION, type UserLocation } from '@/lib/location';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

let mockItems: Array<{
  variantId: string;
  productSlug: string;
  name: string;
  sku: string;
  imagePath: string;
  unitPriceCents: number | null;
  quantity: number;
}> = [];

let mockSubtotal = 0;
const mockUpdateQuantity = vi.fn();
const mockRemove = vi.fn();
const mockClear = vi.fn();

vi.mock('@/components/quote-cart-provider', () => ({
  useQuoteCart: () => ({
    items: mockItems,
    subtotalCents: mockSubtotal,
    count: mockItems.length,
    updateQuantity: mockUpdateQuantity,
    remove: mockRemove,
    clear: mockClear,
    ready: true,
  }),
}));

let mockAuthState: {
  user: {
    id: string;
    email: string;
    firstName: string;
    fullName: string;
    phone?: string;
    document?: string;
  } | null;
  isAuthenticated: boolean;
  ready: boolean;
} = {
  user: null,
  isAuthenticated: false,
  ready: true,
};

vi.mock('@/components/auth-provider', () => ({
  useAuth: () => mockAuthState,
}));

let mockLocationState: UserLocation = DEFAULT_LOCATION;
const mockSetLocation = vi.fn();
const mockOpenModal = vi.fn();

vi.mock('@/components/location-provider', () => ({
  useOptionalUserLocation: () => ({
    location: mockLocationState,
    setLocation: mockSetLocation,
    isModalOpen: false,
    openModal: mockOpenModal,
    closeModal: vi.fn(),
    isHydrated: true,
  }),
}));

afterEach(() => {
  cleanup();
  mockItems = [];
  mockSubtotal = 0;
  mockLocationState = DEFAULT_LOCATION;
  mockAuthState = {
    user: null,
    isAuthenticated: false,
    ready: true,
  };
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe('QuoteFormPage (/cotacao)', () => {
  it('renderiza o estado de cotação vazia quando não há itens', () => {
    mockItems = [];
    mockSubtotal = 0;

    render(<QuoteFormPage />);

    expect(screen.getByText(/Sua cotação está vazia/i)).toBeDefined();
    expect(screen.getByRole('link', { name: /Ver catálogo/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /Entrar/i })).toBeDefined();
  });

  it('exibe etapa 0 para visitante e avança para etapa 1 ao escolher continuar sem conta', () => {
    mockItems = [
      {
        variantId: 'var-1',
        productSlug: 'copo-200ml',
        name: 'Copo 200ml Cristalcopo',
        sku: 'COP-200',
        imagePath: '/img/copo.png',
        unitPriceCents: 1500,
        quantity: 2,
      },
    ];
    mockSubtotal = 3000;

    render(<QuoteFormPage />);

    expect(screen.getByRole('heading', { level: 1, name: /Enviar cotação/i })).toBeDefined();
    expect(screen.getByText(/Copo 200ml Cristalcopo/i)).toBeDefined();
    expect(screen.getAllByText(/R\$\s*30,00/i).length).toBeGreaterThanOrEqual(1);

    // Etapa 0 visível para não logado
    expect(
      screen.getByRole('heading', { name: /Você já tem conta na loja virtual da Comercial do Norte\?/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Fazer login agora/i })).toHaveAttribute(
      'href',
      '/login?redirect=/cotacao',
    );
    expect(screen.getByRole('link', { name: /Criar minha conta agora/i })).toHaveAttribute(
      'href',
      '/login?redirect=/cotacao',
    );

    // Avança sem conta para etapa 1
    fireEvent.click(screen.getByRole('button', { name: /Quero continuar sem conta/i }));

    expect(screen.getByLabelText(/Nome completo/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByLabelText(/WhatsApp/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Enviar cotação$/i })).toBeNull();
  });

  it('pula a etapa 0 quando usuário está logado e já pré-preenche nome e WhatsApp na etapa 1', () => {
    mockAuthState = {
      isAuthenticated: true,
      ready: true,
      user: {
        id: 'usr-1',
        email: 'maria@norte.com',
        firstName: 'Maria',
        fullName: 'Maria Souza',
        phone: '91988887777',
      },
    };
    mockItems = [
      {
        variantId: 'var-1',
        productSlug: 'copo-200ml',
        name: 'Copo 200ml Cristalcopo',
        sku: 'COP-200',
        imagePath: '/img/copo.png',
        unitPriceCents: 1500,
        quantity: 2,
      },
    ];
    mockSubtotal = 3000;

    render(<QuoteFormPage />);

    expect(
      screen.queryByRole('heading', { name: /Você já tem conta na loja virtual da Comercial do Norte\?/i }),
    ).toBeNull();
    expect(screen.getByLabelText(/Nome completo/i, { selector: 'input' })).toHaveValue('Maria Souza');
    expect(screen.getByLabelText(/WhatsApp/i, { selector: 'input' })).toHaveValue('(91) 98888-7777');
    expect(screen.getByText(/Conta conectada/i)).toBeInTheDocument();
  });

  it('valida etapa 1 antes de avançar e exibe lojas ordenadas em km na etapa 2', () => {
    mockItems = [
      {
        variantId: 'var-2',
        productSlug: 'caixa-pizza',
        name: 'Caixa de Pizza 35cm',
        sku: 'CX-35',
        imagePath: '/img/pizza.png',
        unitPriceCents: null,
        quantity: 10,
      },
    ];
    mockSubtotal = 0;
    mockLocationState = {
      cep: '67133-013',
      neighborhood: 'Cidade Nova',
      city: 'Ananindeua',
      state: 'PA',
      formatted: 'Cidade Nova, Ananindeua - PA',
      shortLabel: 'Cidade Nova, Ananindeua/PA',
      source: 'manual',
    };

    render(<QuoteFormPage />);

    // Resumo mostra "Sob cotação" quando unitPriceCents é null
    expect(screen.getAllByText(/Sob cotação/i).length).toBeGreaterThanOrEqual(1);

    // Pula etapa 0 como visitante
    fireEvent.click(screen.getByRole('button', { name: /Quero continuar sem conta/i }));

    // Tenta avançar sem preencher nome e telefone
    fireEvent.click(screen.getByRole('button', { name: /Avançar/i }));
    const alerts = screen.getAllByRole('alert');
    expect(alerts.some((el) => /nome e um WhatsApp válido/i.test(el.textContent ?? ''))).toBe(true);

    // Preenche e avança para etapa 2
    fireEvent.change(screen.getByLabelText(/Nome completo/i, { selector: 'input' }), {
      target: { value: 'Ana Paula' },
    });
    fireEvent.change(screen.getByLabelText(/WhatsApp/i, { selector: 'input' }), {
      target: { value: '91999998888' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Avançar/i }));

    expect(screen.getByRole('heading', { name: /Qual loja você quer atendimento\?/i })).toBeInTheDocument();

    // Primeira opção no radiogroup deve ser Cidade Nova com selo "Mais próxima" e distância em km
    const radios = screen.getAllByRole('radio') as HTMLInputElement[];
    expect(radios[0].value).toBe('loja-cidade-nova');
    expect(radios[0].checked).toBe(true);
    expect(screen.getByText('Mais próxima')).toBeDefined();
    expect(screen.getByText('0,1 km')).toBeDefined();
    expect(screen.queryByRole('button', { name: /Cotar direto no WhatsApp/i })).toBeNull();
  });

  it('percorre todas as etapas, revela dados complementares ao clicar em Sim e envia cotação', async () => {
    mockItems = [
      {
        variantId: 'var-1',
        productSlug: 'copo-200ml',
        name: 'Copo 200ml',
        sku: 'COP-200',
        imagePath: '/img/copo.png',
        unitPriceCents: 1500,
        quantity: 2,
      },
    ];
    mockSubtotal = 3000;
    mockLocationState = {
      cep: '66050-000',
      neighborhood: 'Umarizal',
      city: 'Belém',
      state: 'PA',
      formatted: 'Umarizal, Belém - PA',
      shortLabel: 'Umarizal, Belém/PA',
      source: 'manual',
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ publicId: 'CN-2026-9999' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<QuoteFormPage />);

    // Etapa 0 -> continuar sem conta
    fireEvent.click(screen.getByRole('button', { name: /Quero continuar sem conta/i }));

    // Etapa 1 -> nome e WhatsApp
    fireEvent.change(screen.getByLabelText(/Nome completo/i, { selector: 'input' }), {
      target: { value: 'João da Silva' },
    });
    fireEvent.change(screen.getByLabelText(/WhatsApp/i, { selector: 'input' }), {
      target: { value: '91983440880' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Avançar/i }));

    // Etapa 2 -> Umarizal prioriza lojas de Belém, usuário troca para Matriz São Brás + Delivery
    const radios = screen.getAllByRole('radio') as HTMLInputElement[];
    expect(radios[0].checked).toBe(true);
    expect(radios[radios.length - 1].value).toBe('loja-cidade-nova');

    fireEvent.click(screen.getByTestId('store-option-loja-sao-bras'));
    fireEvent.click(screen.getByRole('button', { name: /Entrega \/ Delivery/i }));
    fireEvent.click(screen.getByRole('button', { name: /Avançar/i }));

    // Etapa 3 -> pergunta complementar; campos extras ainda ocultos
    expect(
      screen.getByRole('heading', { name: /Você quer enviar mais informações complementares\?/i }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/Empresa \/ Comércio/i)).toBeNull();
    expect(screen.queryByLabelText(/CPF ou CNPJ/i)).toBeNull();
    expect(screen.queryByRole('button', { name: /^Enviar cotação$/i })).toBeNull();

    // Clica "Não" -> exibe botão enviar direto sem campos extras
    fireEvent.click(screen.getByRole('button', { name: /^Não/i }));
    expect(screen.queryByLabelText(/Empresa \/ Comércio/i)).toBeNull();
    expect(screen.getByRole('button', { name: /^Enviar cotação$/i })).toBeInTheDocument();

    // Clica "Sim" -> expande empresa, CPF/CNPJ, e-mail e observações
    fireEvent.click(screen.getByRole('button', { name: /^Sim/i }));
    fireEvent.change(screen.getByLabelText(/E-mail/i), {
      target: { value: 'joao@empresa.com.br' },
    });
    fireEvent.change(screen.getByLabelText(/Empresa \/ Comércio/i), {
      target: { value: 'Padaria Norte' },
    });
    fireEvent.change(screen.getByLabelText(/CPF ou CNPJ/i), {
      target: { value: '12345678000199' },
    });
    fireEvent.click(screen.getByRole('button', { name: /\+ Preciso de nota fiscal/i }));

    fireEvent.click(screen.getByRole('button', { name: /^Enviar cotação$/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(requestBody.customerName).toBe('João da Silva');
    expect(requestBody.customerEmail).toBe('joao@empresa.com.br');
    expect(requestBody.companyName).toBe('Padaria Norte');
    expect(requestBody.document).toBe('12.345.678/0001-99');
    expect(requestBody.notes).toContain('Matriz São Brás');
    expect(requestBody.notes).toContain('[Modalidade: Entrega / Delivery]');
    expect(requestBody.notes).toContain('Preciso de nota fiscal (NF-e)');
    expect(mockPush).toHaveBeenCalledWith('/cotacao/CN-2026-9999?storeId=loja-sao-bras');
  });
});
