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
    window.localStorage.clear();
    document.cookie = 'cn_nort_visitor_id=; max-age=0; path=/';
    window.open = vi.fn();
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    document.cookie = 'cn_nort_visitor_id=; max-age=0; path=/';
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

    expect(
      screen.queryByText(/oi! precisa de ajuda com cotação ou produtos\? fala comigo!/i)
    ).toBeNull();

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

    act(() => {
      vi.advanceTimersByTime(15000);
      vi.advanceTimersByTime(2000);
    });

    const dismissBtn = screen.getByRole('button', {
      name: /dispensar aviso do norti/i,
    });
    fireEvent.click(dismissBtn);

    expect(
      screen.queryByText(/oi! precisa de ajuda com cotação ou produtos\? fala comigo!/i)
    ).toBeNull();
  });

  it('ao abrir o chat: remove a barra inferior do Anexo 1, escurece o fundo (97%) e simula digitação lenta e humana etapa por etapa (Anexos 3, 4 e 5)', () => {
    vi.useFakeTimers();
    render(<NortChatFloating whatsapp="5591983440880" />);

    const toggleBtn = screen.getByRole('button', {
      name: /abrir chat com o norti no whatsapp/i,
    });
    fireEvent.click(toggleBtn);

    const dialog = screen.getByRole('dialog', {
      name: /chat de atendimento com o mascote norti/i,
    });
    expect(dialog).toBeDefined();
    expect(dialog.className).toContain('z-[9995]');

    // Garante que a barra inferior do Anexo 1 ("Informe seu nome e WhatsApp acima para iniciar") foi completamente removida
    expect(screen.queryByText(/informe seu nome e whatsapp acima para iniciar/i)).toBeNull();

    // Backdrop 97% escuro e scroll lock ativos
    const backdrop = screen.getByTestId('nort-chat-backdrop');
    expect(backdrop).toBeDefined();
    expect(document.body.style.overflow).toBe('hidden');

    // Etapa 1 (Anexo 3): Indicador de digitação aparece antes da 1ª mensagem (~2 a 4 segundos)
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(screen.getByText('digitando...')).toBeDefined();
    expect(screen.getByLabelText('Nort está digitando')).toBeDefined();
    expect(
      screen.queryByText(/olá! 👋 eu sou o nort, assistente virtual da comercial do norte!/i)
    ).toBeNull();

    // Avança tempo de escrita da 1ª mensagem (~3.6s) -> 1ª mensagem aparece por completo (Anexo 3) e a 2ª ainda NÃO apareceu
    act(() => {
      vi.advanceTimersByTime(3700);
    });
    expect(
      screen.getByText(/olá! 👋 eu sou o nort, assistente virtual da comercial do norte!/i)
    ).toBeDefined();
    expect(
      screen.queryByText(/para começar, me conta: qual é o seu nome e número do whatsapp\?/i)
    ).toBeNull();

    // Etapa 2 (Anexo 4): Após pausa natural de respiração (750ms), o indicador de digitação aparece para a 2ª mensagem
    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(screen.getByText('digitando...')).toBeDefined();
    expect(screen.getByLabelText('Nort está digitando')).toBeDefined();

    // Avança o tempo de escrita da 2ª mensagem (~3.6s) -> 2ª mensagem aparece (Anexo 4), mas o formulário (Anexo 5) ainda aguarda seu ciclo de digitação
    act(() => {
      vi.advanceTimersByTime(3800);
    });
    expect(
      screen.getByText(/para começar, me conta: qual é o seu nome e número do whatsapp\?/i)
    ).toBeDefined();
    expect(screen.queryByPlaceholderText('Como posso te chamar?')).toBeNull();

    // Etapa 3 (Anexo 5): Indicador de digitação aparece antes do formulário e depois exibe o formulário limpo como no Anexo 2
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(screen.getByLabelText('Nort está digitando')).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(2200);
    });
    expect(screen.getByText('online')).toBeDefined();
    expect(screen.queryByLabelText('Nort está digitando')).toBeNull();
    expect(screen.getByPlaceholderText('Como posso te chamar?')).toBeDefined();
    expect(screen.getByPlaceholderText('(91) 99999-9999')).toBeDefined();
    // Continua sem nenhuma barra cinza embaixo (Anexo 2)
    expect(screen.queryByText(/informe seu nome e whatsapp acima para iniciar/i)).toBeNull();
  });

  it('conduz o fluxo completo passo a passo com pausas humanas de digitação e só exibe as opções de serviço após escolher a unidade', () => {
    vi.useFakeTimers();
    render(<NortChatFloating whatsapp="5591983440880" />);

    fireEvent.click(
      screen.getByRole('button', { name: /abrir chat com o norti no whatsapp/i })
    );

    // Conclui a sequência inicial completa (Msg 1 + Msg 2 + Card do formulário)
    act(() => {
      vi.advanceTimersByTime(11000);
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

    // Mensagem do usuário entra no chat e Nort começa a digitar lentamente
    expect(screen.getByText(/carlos mendes/i)).toBeDefined();
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByText('digitando...')).toBeDefined();

    // Avança digitação das mensagens da etapa de unidade + liberação dos botões
    act(() => {
      vi.advanceTimersByTime(10000);
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
      vi.advanceTimersByTime(7000);
    });

    expect(screen.getByText(/selecione a unidade comercial do norte:/i)).toBeDefined();
    expect(screen.getByText(/unidade são brás \(matriz\)/i)).toBeDefined();

    // Confirma a unidade selecionada
    fireEvent.click(screen.getByRole('button', { name: /confirmar unidade selecionada/i }));
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByText('digitando...')).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    // Etapa 3: aparecem as 3 categorias organizadas estilo sanfona (Atendimento, Produtos, Site)
    expect(screen.getByText(/perfeito, carlos mendes! 💙/i)).toBeDefined();
    expect(screen.getByText(/agora me conta, como posso te ajudar hoje\?/i)).toBeDefined();
    expect(screen.getByText(/atendimento & setores/i)).toBeDefined();
    expect(screen.getByText(/produtos & cotação/i)).toBeDefined();
    expect(screen.getByText(/site \/ loja virtual/i)).toBeDefined();

    // Clica na categoria "Produtos & Cotação" para expandir a sanfona
    fireEvent.click(screen.getByText(/produtos & cotação/i));
    expect(screen.getByText(/quero solicitar uma cotação de produtos/i)).toBeDefined();
    expect(screen.getByText(/como faço para consultar produtos no catálogo\?/i)).toBeDefined();
    expect(screen.getByText(/não consigo adicionar itens à cotação/i)).toBeDefined();
    expect(screen.getByText(/preciso tirar dúvidas de faturamento e pagamento/i)).toBeDefined();

    // Seleciona "Quero solicitar uma cotação de produtos" -> registra lead no CRM e abre WhatsApp
    fireEvent.click(screen.getByText(/quero solicitar uma cotação de produtos/i));
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

  it('detecta automaticamente a região por IP/cabeçalho (estilo Magazine Luiza) e oferece seleção de unidades próximas com distância em km e opção de CEP', async () => {
    vi.useFakeTimers();
    render(<NortChatFloating whatsapp="5591983440880" />);

    fireEvent.click(
      screen.getByRole('button', { name: /abrir chat com o norti no whatsapp/i })
    );

    act(() => {
      vi.advanceTimersByTime(11000);
    });

    fireEvent.change(screen.getByPlaceholderText('Como posso te chamar?'), {
      target: { value: 'Maria' },
    });
    fireEvent.change(screen.getByPlaceholderText('(91) 99999-9999'), {
      target: { value: '91981112222' },
    });
    fireEvent.click(screen.getByRole('button', { name: /continuar no chat/i }));

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    await act(async () => {
      fireEvent.click(screen.getByText(/📍 encontrar a mais próxima de mim/i));
      await Promise.resolve();
    });

    // Avança o delay de verificação e a digitação completa das opções com distância
    act(() => {
      vi.advanceTimersByTime(12000);
    });

    // Verifica que o chat calculou as unidades com distância formatada em km/metros
    expect(
      screen.getByText(/olha, a unidade mais próxima de você tem estas opções/i)
    ).toBeDefined();
    expect(screen.getAllByText(/🏪/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/📮 digitar outro cep/i)).toBeDefined();

    // Clica em "Digitar outro CEP" para testar o fallback manual por CEP
    fireEvent.click(screen.getByText(/📮 digitar outro cep/i));

    const cepField = screen.getByPlaceholderText('Informe seu CEP...');
    expect(cepField).toBeDefined();

    fireEvent.change(cepField, { target: { value: '66093005' } });
    expect((cepField as HTMLInputElement).value).toBe('66093-005');

    fireEvent.click(screen.getByRole('button', { name: /localizar unidade mais próxima/i }));

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(screen.getByText(/identifiquei a unidade são brás/i)).toBeDefined();
  });

  it('persiste a conversa no navegador (F5 / reload) com boas-vindas limpas e opções de continuar conversa anterior ou iniciar novo atendimento', () => {
    vi.useFakeTimers();
    const { unmount } = render(<NortChatFloating whatsapp="5591983440880" />);

    fireEvent.click(
      screen.getByRole('button', { name: /abrir chat com o norti no whatsapp/i })
    );

    act(() => {
      vi.advanceTimersByTime(11000);
    });

    fireEvent.change(screen.getByPlaceholderText('Como posso te chamar?'), {
      target: { value: 'Roberto' },
    });
    fireEvent.change(screen.getByPlaceholderText('(91) 99999-9999'), {
      target: { value: '91992223333' },
    });
    fireEvent.click(screen.getByRole('button', { name: /continuar no chat/i }));

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(screen.getByText(/prazer, roberto! 😊/i)).toBeDefined();

    // Simula F5 / recarregamento da página desmontando e montando novamente
    unmount();

    render(<NortChatFloating whatsapp="5591983440880" />);
    fireEvent.click(
      screen.getByRole('button', { name: /abrir chat com o norti no whatsapp/i })
    );

    // Ao reabrir após F5, o Nort cumprimenta calorosamente pelo nome com tela limpa
    act(() => {
      vi.advanceTimersByTime(12000);
    });

    expect(screen.getByText(/oi, roberto! 👋 bem-vindo\(a\) de volta!/i)).toBeDefined();
    expect(screen.getByText(/como posso te ajudar agora\?/i)).toBeDefined();
    // NÃO pede o formulário inicial de Nome/WhatsApp de novo!
    expect(screen.queryByPlaceholderText('Como posso te chamar?')).toBeNull();

    // Apresenta as duas opções de UX limpa
    const resumeBtn = screen.getByText(/💬 continuar conversa anterior/i);
    const newChatBtn = screen.getByText(/🆕 iniciar novo atendimento/i);
    expect(resumeBtn).toBeDefined();
    expect(newChatBtn).toBeDefined();

    // Clica em "Continuar conversa anterior" e restaura os balões
    fireEvent.click(resumeBtn);
    expect(screen.getByText(/prazer, roberto! 😊/i)).toBeDefined();
  });

  it('permite ao visitante alterar seus dados (nome e WhatsApp) sem duplicar lead no CRM', () => {
    vi.useFakeTimers();
    render(<NortChatFloating whatsapp="5591983440880" />);

    fireEvent.click(
      screen.getByRole('button', { name: /abrir chat com o norti no whatsapp/i })
    );

    act(() => {
      vi.advanceTimersByTime(11000);
    });

    fireEvent.change(screen.getByPlaceholderText('Como posso te chamar?'), {
      target: { value: 'Lucas' },
    });
    fireEvent.change(screen.getByPlaceholderText('(91) 99999-9999'), {
      target: { value: '91988112233' },
    });
    fireEvent.click(screen.getByRole('button', { name: /continuar no chat/i }));

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    // Escolhe uma loja
    fireEvent.click(screen.getByText(/🏬 escolher uma unidade/i));
    act(() => {
      vi.advanceTimersByTime(7000);
    });

    fireEvent.click(screen.getByRole('button', { name: /confirmar unidade selecionada/i }));
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    // Na etapa de serviços, clica em "Alterar meus dados"
    const editBtn = screen.getByText(/✏️ alterar meus dados/i);
    expect(editBtn).toBeDefined();
    fireEvent.click(editBtn);

    const editNameInput = screen.getByLabelText(/seu nome/i);
    const editPhoneInput = screen.getByLabelText(/whatsapp/i);
    expect((editNameInput as HTMLInputElement).value).toBe('Lucas');

    // Modifica o nome para "Lucas Rocha" e salva
    fireEvent.change(editNameInput, { target: { value: 'Lucas Rocha' } });
    fireEvent.click(screen.getByRole('button', { name: /salvar alterações/i }));

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(screen.getByText(/prontinho, lucas rocha! seus dados foram atualizados/i)).toBeDefined();
  });

  it('fecha o chat e destrava o scroll da página ao pressionar Escape', () => {
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
      vi.advanceTimersByTime(11000);
    });

    const restartBtn = screen.getByRole('button', { name: /reiniciar conversa/i });
    fireEvent.click(restartBtn);

    act(() => {
      vi.advanceTimersByTime(11000);
    });

    expect(
      screen.getByText(
        /olá! 👋 eu sou o nort, assistente virtual da comercial do norte!/i
      )
    ).toBeDefined();
  });

  it('organiza as opções em sanfona/accordion (Atendimento, Produtos, Site), permitindo expandir e colapsar cada categoria', () => {
    vi.useFakeTimers();
    render(<NortChatFloating whatsapp="5591983440880" />);

    fireEvent.click(
      screen.getByRole('button', { name: /abrir chat com o norti no whatsapp/i })
    );

    act(() => {
      vi.advanceTimersByTime(11000);
    });

    fireEvent.change(screen.getByPlaceholderText('Como posso te chamar?'), {
      target: { value: 'Helena' },
    });
    fireEvent.change(screen.getByPlaceholderText('(91) 99999-9999'), {
      target: { value: '91985554433' },
    });
    fireEvent.click(screen.getByRole('button', { name: /continuar no chat/i }));

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    // Escolhe uma loja
    fireEvent.click(screen.getByText(/🏬 escolher uma unidade/i));
    act(() => {
      vi.advanceTimersByTime(7000);
    });

    fireEvent.click(screen.getByRole('button', { name: /confirmar unidade selecionada/i }));
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    // Inicialmente os subitens das categorias estão colapsados
    expect(screen.queryByText(/quero falar com o setor jurídico/i)).toBeNull();
    expect(screen.queryByText(/quero ajuda para mudar meu cep de entrega/i)).toBeNull();

    // Expande a categoria "Atendimento & Setores"
    fireEvent.click(screen.getByText(/atendimento & setores/i));
    expect(screen.getByText(/quero falar com um atendente humano \(whatsapp\)/i)).toBeDefined();
    expect(screen.getByText(/quero falar com o setor jurídico \(whatsapp\)/i)).toBeDefined();
    expect(screen.getByText(/quero falar com vendas no whatsapp/i)).toBeDefined();
    expect(screen.getByText(/ver endereço e horários de funcionamento/i)).toBeDefined();

    // Clica novamente na mesma categoria -> colapsa os subitens
    fireEvent.click(screen.getByText(/atendimento & setores/i));
    expect(screen.queryByText(/quero falar com o setor jurídico \(whatsapp\)/i)).toBeNull();

    // Expande a categoria "Site / Loja Virtual"
    fireEvent.click(screen.getByText(/site \/ loja virtual/i));
    expect(screen.getByText(/quero ajuda para mudar meu cep de entrega/i)).toBeDefined();
    expect(screen.getByText(/esqueci meu login e senha \(como recuperar\)/i)).toBeDefined();
    expect(screen.getByText(/fazer tour guiado interativo pela loja/i)).toBeDefined();

    // Ao clicar em "Quero ajuda para mudar meu CEP de entrega", o Nort responde e abre o campo de CEP
    fireEvent.click(screen.getByText(/quero ajuda para mudar meu CEP de entrega/i));
    act(() => {
      vi.advanceTimersByTime(12000);
    });

    expect(screen.getByPlaceholderText('Informe seu CEP...')).toBeDefined();
  });
});
