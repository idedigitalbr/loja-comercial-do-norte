/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NortChatFloating } from './nort-chat-floating';

const mockStartTour = vi.fn();
vi.mock('./tour', () => ({
  useNortTour: () => ({
    startTour: mockStartTour,
  }),
}));

vi.mock('next/image', () => ({
  default: ({ fill, priority, ...props }: any) => <img {...props} />,
}));

describe('NortChatFloating Component (WhatsApp & CRM Floating Chat)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.open = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  it('inicia com o botão flutuante e o balão de prévia visíveis', () => {
    render(<NortChatFloating whatsapp="5591983440880" />);

    // Botão flutuante existe
    const toggleBtn = screen.getByRole('button', {
      name: /abrir chat com o norti no whatsapp/i,
    });
    expect(toggleBtn).toBeDefined();

    // Balão de prévia / convite
    expect(
      screen.getByText(/oi! precisa de ajuda com cotação ou produtos\? fala comigo!/i)
    ).toBeDefined();
  });

  it('permite dispensar o balão de prévia clicando no X do aviso', () => {
    render(<NortChatFloating whatsapp="5591983440880" />);

    const dismissBtn = screen.getByRole('button', {
      name: /dispensar aviso do norti/i,
    });
    fireEvent.click(dismissBtn);

    expect(
      screen.queryByText(/oi! precisa de ajuda com cotação ou produtos\? fala comigo!/i)
    ).toBeNull();
  });

  it('abre o modal de chat estilo WhatsApp ao clicar no botão flutuante', () => {
    render(<NortChatFloating whatsapp="5591983440880" />);

    const toggleBtn = screen.getByRole('button', {
      name: /abrir chat com o norti no whatsapp/i,
    });
    fireEvent.click(toggleBtn);

    // Modal de diálogo aberto
    const dialog = screen.getByRole('dialog', {
      name: /chat de atendimento com o mascote norti/i,
    });
    expect(dialog).toBeDefined();

    // Mensagem de boas-vindas do Norti
    expect(screen.getByText(/oi! eu sou o norti! 👋/i)).toBeDefined();

    // Opções de atendimento disponíveis
    expect(screen.getByText(/falar com vendas no whatsapp/i)).toBeDefined();
    expect(screen.getByText(/ajuda com lista de cotação/i)).toBeDefined();
    expect(screen.getByText(/fazer tour guiado na loja/i)).toBeDefined();
    expect(screen.getByText(/endereços e horários das lojas/i)).toBeDefined();
    expect(screen.getByText(/suporte e pós-venda crm/i)).toBeDefined();
  });

  it('aciona o tour guiado e fecha o chat ao clicar na opção de Tour', () => {
    render(<NortChatFloating whatsapp="5591983440880" />);

    // Abre o chat
    fireEvent.click(
      screen.getByRole('button', { name: /abrir chat com o norti no whatsapp/i })
    );

    // Clica no botão de tour
    const tourBtn = screen.getByRole('button', {
      name: /fazer tour guiado na loja/i,
    });
    fireEvent.click(tourBtn);

    expect(mockStartTour).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole('dialog', {
        name: /chat de atendimento com o mascote norti/i,
      })
    ).toBeNull();
  });

  it('redireciona para o WhatsApp com mensagem contextualizada ao escolher atendimento de vendas', () => {
    render(<NortChatFloating whatsapp="5591983440880" />);

    fireEvent.click(
      screen.getByRole('button', { name: /abrir chat com o norti no whatsapp/i })
    );

    const vendasBtn = screen.getByRole('button', {
      name: /falar com vendas no whatsapp/i,
    });
    fireEvent.click(vendasBtn);

    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('https://wa.me/5591983440880?text='),
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('exibe e oculta as informações de lojas ao alternar a opção', () => {
    render(<NortChatFloating whatsapp="5591983440880" />);

    fireEvent.click(
      screen.getByRole('button', { name: /abrir chat com o norti no whatsapp/i })
    );

    const lojasBtn = screen.getByRole('button', {
      name: /endereços e horários das lojas/i,
    });

    // 1º clique: exibe lojas
    fireEvent.click(lojasBtn);
    expect(screen.getByText(/nossas unidades em belém e região:/i)).toBeDefined();
    expect(screen.getByText(/av\. bernardo sayão, 608/i)).toBeDefined();

    // 2º clique: oculta lojas
    fireEvent.click(lojasBtn);
    expect(screen.queryByText(/nossas unidades em belém e região:/i)).toBeNull();
  });

  it('permite enviar mensagem digitada diretamente para o WhatsApp', () => {
    render(<NortChatFloating whatsapp="5591983440880" />);

    fireEvent.click(
      screen.getByRole('button', { name: /abrir chat com o norti no whatsapp/i })
    );

    const input = screen.getByLabelText(
      /digite sua mensagem para o atendimento/i
    );
    fireEvent.change(input, {
      target: { value: 'Gostaria de saber o preço de caixas de pizza' },
    });

    const sendBtn = screen.getByRole('button', {
      name: /enviar mensagem no whatsapp/i,
    });
    fireEvent.click(sendBtn);

    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining(
        encodeURIComponent('Gostaria de saber o preço de caixas de pizza')
      ),
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('fecha o chat ao pressionar a tecla Escape', () => {
    render(<NortChatFloating whatsapp="5591983440880" />);

    fireEvent.click(
      screen.getByRole('button', { name: /abrir chat com o norti no whatsapp/i })
    );
    expect(
      screen.getByRole('dialog', {
        name: /chat de atendimento com o mascote norti/i,
      })
    ).toBeDefined();

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(
      screen.queryByRole('dialog', {
        name: /chat de atendimento com o mascote norti/i,
      })
    ).toBeNull();
  });
});
