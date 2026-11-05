/**
 * @vitest-environment jsdom
 */
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NortChatFloating } from './nort-chat-floating';

const mockStartTour = vi.fn();
vi.mock('./tour', () => ({
  useNortTour: () => ({
    startTour: mockStartTour,
  }),
}));

vi.mock('next/image', () => ({
  default: ({ fill, priority, unoptimized, ...props }: any) => <img {...props} />,
}));

describe('NortChatFloating Component (WhatsApp Conversational Guided Chat)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.open = vi.fn();
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('inicia com o botão flutuante sólido (sem gradiente) e o balão de prévia visíveis', () => {
    render(<NortChatFloating whatsapp="5591983440880" />);

    const toggleBtn = screen.getByRole('button', {
      name: /abrir chat com o norti no whatsapp/i,
    });
    expect(toggleBtn).toBeDefined();
    // Garante proibição de gradientes no botão flutuante
    expect(toggleBtn.className).not.toContain('bg-gradient');
    expect(toggleBtn.className).toContain('bg-[#00A884]');

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

  it('abre o modal de chat estilo WhatsApp com cabeçalho #075844, wallpaper e apresentação do Nort', () => {
    render(<NortChatFloating whatsapp="5591983440880" />);

    const toggleBtn = screen.getByRole('button', {
      name: /abrir chat com o norti no whatsapp/i,
    });
    fireEvent.click(toggleBtn);

    const dialog = screen.getByRole('dialog', {
      name: /chat de atendimento com o mascote norti/i,
    });
    expect(dialog).toBeDefined();

    // Cabeçalho oficial Nort | Comercial do Norte e status online
    expect(screen.getByText('Nort | Comercial do Norte')).toBeDefined();
    expect(screen.getByText('online')).toBeDefined();

    // Mensagem inicial exata da Seção 2
    expect(
      screen.getByText(
        /olá! 👋 eu sou o nort, assistente virtual da comercial do norte!/i
      )
    ).toBeDefined();

    // Formulário integrado à conversa com Nome e WhatsApp
    expect(screen.getByPlaceholderText('Como posso te chamar?')).toBeDefined();
    expect(screen.getByPlaceholderText('(91) 99999-9999')).toBeDefined();

    // Opções de resposta rápida estilo WhatsApp
    expect(screen.getByText(/falar com vendas no whatsapp/i)).toBeDefined();
    expect(screen.getByText(/ajuda com lista de cotação/i)).toBeDefined();
    expect(screen.getByText(/fazer tour guiado na loja/i)).toBeDefined();
    expect(screen.getByText(/endereços e horários das lojas/i)).toBeDefined();
    expect(screen.getByText(/suporte e pós-venda crm/i)).toBeDefined();
  });

  it('valida campos obrigatórios, aplica máscara de WhatsApp e conduz o fluxo completo com indicador digitando...', async () => {
    vi.useFakeTimers();
    render(<NortChatFloating whatsapp="5591983440880" />);

    fireEvent.click(
      screen.getByRole('button', { name: /abrir chat com o norti no whatsapp/i })
    );

    const continueBtn = screen.getByRole('button', { name: /continuar no chat/i });

    // Tenta enviar vazio -> exibe validação amigável
    fireEvent.click(continueBtn);
    expect(screen.getByRole('alert').textContent).toMatch(/informe seu nome/i);

    const nameInput = screen.getByPlaceholderText('Como posso te chamar?');
    const phoneInput = screen.getByPlaceholderText('(91) 99999-9999');

    fireEvent.change(nameInput, { target: { value: 'Carlos Mendes' } });
    fireEvent.change(phoneInput, { target: { value: '91988776655' } });

    // Verifica máscara brasileira (91) 98877-6655
    expect((phoneInput as HTMLInputElement).value).toBe('(91) 98877-6655');

    // Envia identificação
    fireEvent.click(continueBtn);

    // Resposta do usuário aparece como balão enviado e Nort entra em estado "digitando..."
    expect(screen.getByText(/carlos mendes/i)).toBeDefined();
    expect(screen.getByText('digitando...')).toBeDefined();
    expect(screen.getByLabelText('Nort está digitando')).toBeDefined();

    // Avança o tempo de digitação
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    // Nort responde usando o nome informado e exibe as duas opções de unidade (Seção 3)
    expect(screen.getByText('online')).toBeDefined();
    expect(screen.getByText(/prazer, carlos mendes! 😊/i)).toBeDefined();
    expect(screen.getByText(/📍 encontrar a mais próxima de mim/i)).toBeDefined();
    expect(screen.getByText(/🏬 escolher uma unidade/i)).toBeDefined();

    // Escolhe "Escolher uma unidade"
    fireEvent.click(screen.getByText(/🏬 escolher uma unidade/i));
    expect(screen.getByText(/selecione a unidade comercial do norte:/i)).toBeDefined();
    expect(screen.getByText(/unidade são brás \(matriz\)/i)).toBeDefined();

    // Confirma a unidade selecionada
    fireEvent.click(screen.getByRole('button', { name: /confirmar unidade selecionada/i }));
    expect(screen.getByText('digitando...')).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    // Terceira interação (Seção 4): Como podemos ajudar?
    expect(screen.getByText(/perfeito, carlos mendes! 💙/i)).toBeDefined();
    expect(screen.getByText(/🛍️ consultar produtos/i)).toBeDefined();
    expect(screen.getByText(/📋 solicitar uma cotação/i)).toBeDefined();
    expect(screen.getByText(/📍 endereço e horários/i)).toBeDefined();
    expect(screen.getByText(/💬 falar com um atendente/i)).toBeDefined();

    // Seleciona "Solicitar uma cotação" -> registra lead no CRM e abre WhatsApp
    fireEvent.click(screen.getByText(/📋 solicitar uma cotação/i));
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/crm/leads',
      expect.objectContaining({ method: 'POST' })
    );
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('https://wa.me/5591983440880?text='),
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('oferece busca por CEP quando a localização do navegador não está disponível', () => {
    vi.useFakeTimers();
    render(<NortChatFloating whatsapp="5591983440880" />);

    fireEvent.click(
      screen.getByRole('button', { name: /abrir chat com o norti no whatsapp/i })
    );

    fireEvent.change(screen.getByPlaceholderText('Como posso te chamar?'), {
      target: { value: 'Maria' },
    });
    fireEvent.change(screen.getByPlaceholderText('(91) 99999-9999'), {
      target: { value: '91981112222' },
    });
    fireEvent.click(screen.getByRole('button', { name: /continuar no chat/i }));

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    // Clica em "Encontrar a mais próxima de mim" (sem navigator.geolocation no jsdom padrão)
    fireEvent.click(screen.getByText(/📍 encontrar a mais próxima de mim/i));

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    const cepField = screen.getByPlaceholderText('Informe seu CEP...');
    expect(cepField).toBeDefined();

    fireEvent.change(cepField, { target: { value: '66093005' } });
    expect((cepField as HTMLInputElement).value).toBe('66093-005');

    fireEvent.click(screen.getByRole('button', { name: /localizar unidade mais próxima/i }));

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByText(/identifiquei a unidade são brás/i)).toBeDefined();
  });

  it('aciona o tour guiado e fecha o chat ao clicar na opção de Tour', () => {
    render(<NortChatFloating whatsapp="5591983440880" />);

    fireEvent.click(
      screen.getByRole('button', { name: /abrir chat com o norti no whatsapp/i })
    );

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

    fireEvent.click(lojasBtn);
    expect(screen.getByText(/nossas unidades em belém e região:/i)).toBeDefined();
    expect(screen.getByText(/av\. bernardo sayão, 608/i)).toBeDefined();

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

  it('permite reiniciar o atendimento pelo botão de reiniciar', () => {
    render(<NortChatFloating whatsapp="5591983440880" />);

    fireEvent.click(
      screen.getByRole('button', { name: /abrir chat com o norti no whatsapp/i })
    );

    const restartBtn = screen.getByRole('button', { name: /reiniciar conversa/i });
    expect(restartBtn).toBeDefined();
    fireEvent.click(restartBtn);

    expect(
      screen.getByText(
        /olá! 👋 eu sou o nort, assistente virtual da comercial do norte!/i
      )
    ).toBeDefined();
  });
});
