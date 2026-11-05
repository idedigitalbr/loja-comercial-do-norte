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
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  });

  it('inicia com o botão flutuante sólido e o balão de prévia oculto até o timer de 15s', () => {
    vi.useFakeTimers();
    render(<NortChatFloating whatsapp="5591983440880" />);

    const toggleBtn = screen.getByRole('button', {
      name: /abrir chat com o norti no whatsapp/i,
    });
    expect(toggleBtn).toBeDefined();
    expect(toggleBtn.className).not.toContain('bg-gradient');
    expect(toggleBtn.className).toContain('bg-[#00A884]');

    // Inicialmente oculto (não mostra fixo)
    expect(
      screen.queryByText(/oi! precisa de ajuda com cotação ou produtos\? fala comigo!/i)
    ).toBeNull();

    // Avança 15s para dar o pop + tempo da digitação suave
    act(() => {
      vi.advanceTimersByTime(15000);
      vi.advanceTimersByTime(2000);
    });

    expect(
      screen.getByText(/oi! precisa de ajuda com cotação ou produtos\? fala comigo!/i)
    ).toBeDefined();
  });

  it('permite dispensar o balão de prévia clicando no X do aviso', () => {
    vi.useFakeTimers();
    render(<NortChatFloating whatsapp="5591983440880" />);

    // Avança para o balão surgir
    act(() => {
      vi.advanceTimersByTime(17000);
    });

    const dismissBtn = screen.getByRole('button', {
      name: /dispensar aviso do norti/i,
    });
    fireEvent.click(dismissBtn);

    expect(
      screen.queryByText(/oi! precisa de ajuda com cotação ou produtos\? fala comigo!/i)
    ).toBeNull();
  });

  it('fecha automaticamente o balão de prévia após 10 segundos de exibição', () => {
    vi.useFakeTimers();
    render(<NortChatFloating whatsapp="5591983440880" />);

    // Avança para o balão surgir e digitar
    act(() => {
      vi.advanceTimersByTime(17000);
    });
    expect(
      screen.getByText(/oi! precisa de ajuda com cotação ou produtos\? fala comigo!/i)
    ).toBeDefined();

    // Avança 10s de tempo visível
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(
      screen.queryByText(/oi! precisa de ajuda com cotação ou produtos\? fala comigo!/i)
    ).toBeNull();
  });

  it('ao abrir o chat: escurece o fundo da página (97%), trava o scroll da página e envia as mensagens iniciais uma a uma com indicador digitando...', () => {
    vi.useFakeTimers();
    render(<NortChatFloating whatsapp="5591983440880" />);

    const toggleBtn = screen.getByRole('button', {
      name: /abrir chat com o norti no whatsapp/i,
    });
    fireEvent.click(toggleBtn);

    // 1. Verifica modal, backdrop 97% escuro acima do header (z-[9990]) e scroll travado
    const dialog = screen.getByRole('dialog', {
      name: /chat de atendimento com o mascote norti/i,
    });
    expect(dialog).toBeDefined();
    expect(dialog.className).toContain('z-[9995]');

    const backdrop = screen.getByTestId('nort-chat-backdrop');
    expect(backdrop).toBeDefined();
    expect(backdrop.className).toContain('z-[9990]');
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.documentElement.style.overflow).toBe('hidden');

    // 2. No instante 0ms: Nort começa digitando a primeira mensagem (não mostra tudo de uma vez!)
    act(() => {
      vi.advanceTimersByTime(10);
    });
    expect(screen.getByText('digitando...')).toBeDefined();
    expect(screen.getByLabelText('Nort está digitando')).toBeDefined();
    expect(screen.queryByPlaceholderText('Como posso te chamar?')).toBeNull();
    // Os botões de serviço não aparecem na primeira tela!
    expect(screen.queryByText(/falar com vendas no whatsapp/i)).toBeNull();

    // 3. Após ~800ms: chega a 1ª mensagem de apresentação, e logo em seguida Nort volta a digitar a 2ª
    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(
      screen.getByText(/olá! 👋 eu sou o nort, assistente virtual da comercial do norte!/i)
    ).toBeDefined();

    // 4. Após o segundo ciclo de digitação: chega a 2ª mensagem e o formulário de Nome/WhatsApp é liberado
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.getByText('online')).toBeDefined();
    expect(
      screen.getByText(/para começar, me conta: qual é o seu nome e número do whatsapp\?/i)
    ).toBeDefined();
    expect(screen.getByPlaceholderText('Como posso te chamar?')).toBeDefined();
    expect(screen.getByPlaceholderText('(91) 99999-9999')).toBeDefined();
    // Continua sem mostrar os botões da última etapa na tela inicial
    expect(screen.queryByText(/falar com vendas no whatsapp/i)).toBeNull();
  });

  it('conduz o fluxo completo passo a passo com pausas de digitação e só exibe as opções de serviço após escolher a unidade', () => {
    vi.useFakeTimers();
    render(<NortChatFloating whatsapp="5591983440880" />);

    fireEvent.click(
      screen.getByRole('button', { name: /abrir chat com o norti no whatsapp/i })
    );

    // Conclui digitação inicial das 2 mensagens
    act(() => {
      vi.advanceTimersByTime(2500);
    });

    const continueBtn = screen.getByRole('button', { name: /continuar no chat/i });

    // Validação de campos obrigatórios
    fireEvent.click(continueBtn);
    expect(screen.getByRole('alert').textContent).toMatch(/informe seu nome/i);

    const nameInput = screen.getByPlaceholderText('Como posso te chamar?');
    const phoneInput = screen.getByPlaceholderText('(91) 99999-9999');

    fireEvent.change(nameInput, { target: { value: 'Carlos Mendes' } });
    fireEvent.change(phoneInput, { target: { value: '91988776655' } });
    expect((phoneInput as HTMLInputElement).value).toBe('(91) 98877-6655');

    // Envia identificação
    fireEvent.click(continueBtn);

    // Mensagem do usuário entra no chat e Nort começa a digitar a resposta
    expect(screen.getByText(/carlos mendes/i)).toBeDefined();
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(screen.getByText('digitando...')).toBeDefined();

    // Avança digitação das 2 mensagens da etapa de unidade
    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(screen.getByText('online')).toBeDefined();
    expect(screen.getByText(/prazer, carlos mendes! 😊/i)).toBeDefined();
    expect(
      screen.getByText(
        /agora me diz: em qual unidade da comercial do norte você gostaria de ser atendido\?/i
      )
    ).toBeDefined();
    expect(screen.getByText(/📍 encontrar a mais próxima de mim/i)).toBeDefined();
    expect(screen.getByText(/🏬 escolher uma unidade/i)).toBeDefined();

    // Escolhe "Escolher uma unidade"
    fireEvent.click(screen.getByText(/🏬 escolher uma unidade/i));
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByText(/selecione a unidade comercial do norte:/i)).toBeDefined();
    expect(screen.getByText(/unidade são brás \(matriz\)/i)).toBeDefined();

    // Confirma a unidade selecionada
    fireEvent.click(screen.getByRole('button', { name: /confirmar unidade selecionada/i }));
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(screen.getByText('digitando...')).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    // Agora sim (Etapa 3) aparecem os botões de serviço e atendimento!
    expect(screen.getByText(/perfeito, carlos mendes! 💙/i)).toBeDefined();
    expect(screen.getByText(/agora me conta, como posso te ajudar hoje\?/i)).toBeDefined();
    expect(screen.getByText(/🛍️ consultar produtos/i)).toBeDefined();
    expect(screen.getByText(/📋 solicitar uma cotação/i)).toBeDefined();
    expect(screen.getByText(/📍 endereço e horários/i)).toBeDefined();
    expect(screen.getByText(/💬 falar com um atendente/i)).toBeDefined();
    expect(screen.getByText(/💬 falar com vendas no whatsapp/i)).toBeDefined();
    expect(screen.getByText(/🧭 fazer tour guiado na loja/i)).toBeDefined();

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

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    fireEvent.change(screen.getByPlaceholderText('Como posso te chamar?'), {
      target: { value: 'Maria' },
    });
    fireEvent.change(screen.getByPlaceholderText('(91) 99999-9999'), {
      target: { value: '91981112222' },
    });
    fireEvent.click(screen.getByRole('button', { name: /continuar no chat/i }));

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    fireEvent.click(screen.getByText(/📍 encontrar a mais próxima de mim/i));

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    const cepField = screen.getByPlaceholderText('Informe seu CEP...');
    expect(cepField).toBeDefined();

    fireEvent.change(cepField, { target: { value: '66093005' } });
    expect((cepField as HTMLInputElement).value).toBe('66093-005');

    fireEvent.click(screen.getByRole('button', { name: /localizar unidade mais próxima/i }));

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(screen.getByText(/identifiquei a unidade são brás/i)).toBeDefined();
  });

  it('fecha o chat e destrava o scroll da página ao pressionar Escape ou clicar no backdrop escuro', () => {
    render(<NortChatFloating whatsapp="5591983440880" />);

    fireEvent.click(
      screen.getByRole('button', { name: /abrir chat com o norti no whatsapp/i })
    );
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(
      screen.queryByRole('dialog', {
        name: /chat de atendimento com o mascote norti/i,
      })
    ).toBeNull();
    expect(document.body.style.overflow).toBe('');
  });

  it('permite reiniciar o atendimento com sequência de digitação desde o início', () => {
    vi.useFakeTimers();
    render(<NortChatFloating whatsapp="5591983440880" />);

    fireEvent.click(
      screen.getByRole('button', { name: /abrir chat com o norti no whatsapp/i })
    );
    act(() => {
      vi.advanceTimersByTime(2500);
    });

    const restartBtn = screen.getByRole('button', { name: /reiniciar conversa/i });
    fireEvent.click(restartBtn);

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(
      screen.getByText(
        /olá! 👋 eu sou o nort, assistente virtual da comercial do norte!/i
      )
    ).toBeDefined();
  });
});
