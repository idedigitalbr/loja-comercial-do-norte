import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { StorefrontShell } from '../components/storefront-shell';
import { LegacyCarousel } from '../components/legacy-media-components';
import { StorefrontRoutes } from '../routes/router';

describe('institutional public pages', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('renders the institutional home at the root route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <StorefrontRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Você linda todos os dias' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver Produtos' })).toHaveAttribute('href', '/loja');
    expect(screen.getByRole('heading', { name: 'Depoimentos de Nossos Clientes' })).toBeInTheDocument();
  });

  it('recreates the legacy home sections, copy and service imagery', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <StorefrontRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByText('Especialistas em cabelos e unhas, com atendimento de qualidade')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'SOBRE NÓS' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Conheça nossa Loja de Produtos' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Agende agora – Serviço de Cabeleireiro' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Agende agora – Serviço de Unhas' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Depoimentos de Nossos Clientes' })).toBeInTheDocument();
    expect(screen.getByText('Ana Julia - cliente desde 2022')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '“Beleza que vai além do espelho.”' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '“Um lugar que transforma.”' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Cliente do Jonas & Elivaldo Hair Designers' })).toBeInTheDocument();
    expect(screen.getByText('Patrícia Lima - Cliente desde 2019')).toBeInTheDocument();
    expect(screen.getByText('Camila Ferreira - Cliente desde 2024')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'cabelo-morena-iluminada-tom-mel' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'image (1)' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'IMG_8704.JPG' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'make (1)' })).toBeInTheDocument();
    expect(screen.queryByText('01')).not.toBeInTheDocument();
    expect(screen.queryByText('05')).not.toBeInTheDocument();

    const services = document.querySelector('.institutional-home__services') as HTMLElement;
    const gallery = screen.getByRole('region', { name: 'Galeria do salão' });
    const shop = document.querySelector('.institutional-home__shop') as HTMLElement;
    expect(services.compareDocumentPosition(gallery) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(gallery.compareDocumentPosition(shop) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('uses Lucide icons for institutional actions and reassurance cards', () => {
    const { unmount } = render(
      <MemoryRouter initialEntries={['/']}>
        <StorefrontRoutes />
      </MemoryRouter>,
    );

    expect(document.querySelector('.institutional-home__hero [data-icon="play"].lucide')).toBeInTheDocument();
    expect(document.querySelector('.institutional-home__motion-toggle [data-icon="pause"].lucide')).toBeInTheDocument();
    expect(document.querySelector('.institutional-home__scroll [data-icon="arrow-down"].lucide')).toBeInTheDocument();
    expect(document.querySelectorAll('.institutional-testimonial__rating [data-icon="star"].lucide')).toHaveLength(5);

    unmount();
    render(
      <MemoryRouter initialEntries={['/cabelos-e-penteados']}>
        <StorefrontRoutes />
      </MemoryRouter>,
    );

    expect(document.querySelector('.service-detail__hero [data-icon="arrow-down"].lucide')).toBeInTheDocument();
    expect(document.querySelectorAll('.service-detail__reassurance-grid [data-icon].lucide')).toHaveLength(3);
    expect(document.querySelectorAll('.service-detail__solution-body li [data-icon="check"].lucide').length).toBeGreaterThan(0);
    expect(document.querySelectorAll('.service-detail__solution-body li').length).toBeGreaterThan(0);
  });

  it('stops automatic home movement when reduced motion is requested', () => {
    vi.useFakeTimers();
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    render(<MemoryRouter initialEntries={['/']}><StorefrontRoutes /></MemoryRouter>);

    const firstSlide = document.querySelector('.institutional-home__hero-background') as HTMLElement;
    expect(firstSlide).toHaveClass('is-active');
    vi.advanceTimersByTime(2_500);
    expect(firstSlide).toHaveClass('is-active');
  });

  it('supports keyboard, swipe and interaction pause in reusable carousels', () => {
    vi.useFakeTimers();
    render(<LegacyCarousel label="Galeria de teste" autoPlay={1000} images={[{ src: '/one.jpg', alt: 'Foto um' }, { src: '/two.jpg', alt: 'Foto dois' }]} />);
    const carousel = screen.getByRole('region', { name: 'Galeria de teste' });

    fireEvent.keyDown(carousel, { key: 'ArrowRight' });
    expect(within(carousel).getByText('2 de 2')).toBeInTheDocument();
    fireEvent.pointerDown(carousel, { clientX: 100 });
    fireEvent.pointerUp(carousel, { clientX: 20 });
    expect(within(carousel).getByText('1 de 2')).toBeInTheDocument();
    vi.advanceTimersByTime(3000);
    expect(within(carousel).getByText('1 de 2')).toBeInTheDocument();
  });

  it('keeps customer login at /entrar', () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    render(
      <MemoryRouter initialEntries={['/entrar']}>
        <StorefrontRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Entrar na conta' })).toBeInTheDocument();
  });

  it.each([
    ['/sobre-nos', 'Nossa História'],
    ['/servicos', 'Serviços para realçar sua beleza'],
    ['/certificacao-internacional', 'Padrão internacional'],
  ] as const)('renders %s with its primary heading', (path, heading) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <StorefrontRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
  });

  it('exposes the essential institutional content without adding a legacy-page CTA', () => {
    render(
      <MemoryRouter initialEntries={['/sobre-nos']}>
        <StorefrontRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Missão' })).toBeInTheDocument();
    expect(screen.getByText('Jonas Moreira')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /WhatsApp/i })).not.toBeInTheDocument();
  });

  it('recreates the legacy about page sections, people and imagery', () => {
    render(
      <MemoryRouter initialEntries={['/sobre-nos']}>
        <StorefrontRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Nossa História' })).toBeInTheDocument();
    expect(screen.getByText(/em 2009 nasceu o primeiro salão, Belos Fios/)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Jonas & Elivaldo Hair Designers em sua história' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Missão' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Visão' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Valores' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Nossa Equipe' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Jonas Moreira' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Heloísa Dias' })).toBeInTheDocument();
    expect(screen.getByText('Júnior Bessa')).toBeInTheDocument();
    expect(document.querySelectorAll('.institutional-about__value-icon[data-icon].lucide')).toHaveLength(3);
  });

  it('renders the service and certification calls to action', () => {
    const { unmount } = render(
      <MemoryRouter initialEntries={['/servicos']}>
        <StorefrontRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByText('Cabelos & Penteados')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /WhatsApp/i })[0]).toHaveAttribute('href', 'https://wa.me/5596981001897');

    unmount();
    render(
      <MemoryRouter initialEntries={['/certificacao-internacional']}>
        <StorefrontRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Verificar certificação' })).toHaveAttribute('href', 'https://cnbs.com.br/produto/elivaldo-lima-barreto/');
    expect(screen.getByText('Técnicas Avançadas')).toBeInTheDocument();
  });

  it.each([
    ['/cabelos-e-penteados', 'Cabelos & Penteados', 'Corte Feminino', 'Cabelos bem cuidados, Autoestima lá em cima!'],
    ['/maquiagem', 'Maquiagem', 'Make Express', 'Realce sua beleza com uma maquiagem profissional para cada ocasião'],
    ['/manicure-pedicure', 'Manicure & Pedicure', 'Pacote Completo', 'Unhas bem cuidadas , autoestima lá em cima!'],
    ['/terapia-capilar', 'Terapia Capilar', 'Terapia Capilar Avançada', 'Sofrendo com queda de cabelo ou problemas no couro cabeludo?'],
  ] as const)('recreates the legacy service page structure at %s', (path, title, solution, lead) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <StorefrontRoutes />
      </MemoryRouter>,
    );

    expect(screen.getAllByRole('heading', { name: title })[0]).toBeInTheDocument();
    expect(screen.getByText(lead)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: solution })).toBeInTheDocument();
    const whatsappLinks = screen.getAllByRole('link', { name: /chame no whatsapp/i });
    expect(whatsappLinks).toHaveLength(2);
    expect(whatsappLinks[0]).toHaveAttribute('href', 'https://wa.me/5596981001897');
    expect(screen.getByRole('heading', { name: 'Atendimento Personalizado' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Saiba mais/i })).toHaveAttribute('href', '#service-intro');
  });

  it('replicates the legacy Cabelos & Penteados closing section visual contract', () => {
    render(
      <MemoryRouter initialEntries={['/cabelos-e-penteados']}>
        <StorefrontRoutes />
      </MemoryRouter>,
    );

    const closing = document.querySelector('.service-detail__closing');

    expect(closing).toHaveClass('service-detail__closing--image');
    expect(closing).toHaveStyle({
      backgroundImage: 'url("https://jonaselivaldohair.com.br/wp-content/uploads/2026/03/Gemini_Generated_Image_5v2yzx5v2yzx5v2y-1.png")',
    });
    expect(within(closing as HTMLElement).getByText('Serviço Cabelos e Penteados')).toBeInTheDocument();
    expect(within(closing as HTMLElement).getByRole('link', { name: /chame no whatsapp/i })).toBeInTheDocument();
    expect(within(closing as HTMLElement).getAllByRole('article')).toHaveLength(3);
    expect(within(closing as HTMLElement).getByRole('heading', { name: 'Atendimento Personalizado' })).toBeInTheDocument();
    expect(within(closing as HTMLElement).getByRole('heading', { name: 'Profissionais Qualificados' })).toBeInTheDocument();
    expect(within(closing as HTMLElement).getByRole('heading', { name: 'Mais Beleza e Autoestima' })).toBeInTheDocument();
  });

  it('exposes the four service pages from the desktop navigation', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <StorefrontShell><StorefrontRoutes /></StorefrontShell>
      </MemoryRouter>,
    );

    const primaryNavigation = within(screen.getByRole('navigation', { name: 'Navegação principal' }));
    expect(primaryNavigation.getByRole('link', { name: 'Cabelos e Penteados' })).toHaveAttribute('href', '/cabelos-e-penteados');
    expect(primaryNavigation.getByRole('link', { name: 'Maquiagem' })).toHaveAttribute('href', '/maquiagem');
    expect(primaryNavigation.getByRole('link', { name: 'Manicure & Pedicure' })).toHaveAttribute('href', '/manicure-pedicure');
    expect(primaryNavigation.getByRole('link', { name: 'Terapia Capilar' })).toHaveAttribute('href', '/terapia-capilar');
  });

  it('expands the complete hair gallery and opens an accessible lightbox', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/cabelos-e-penteados']}>
        <StorefrontRoutes />
      </MemoryRouter>,
    );

    const gallery = screen.getByRole('region', { name: 'Galeria de Cabelos & Penteados' });
    expect(within(gallery).getAllByRole('button', { name: /Abrir foto/ })).toHaveLength(6);

    await user.click(within(gallery).getByRole('button', { name: /Ver mais \(35 restantes\)/i }));
    expect(within(gallery).getAllByRole('button', { name: /Abrir foto/ })).toHaveLength(41);

    const firstPhoto = within(gallery).getAllByRole('button', { name: /Abrir foto/ })[0];
    await user.click(firstPhoto);
    const lightbox = screen.getByRole('dialog', { name: 'Visualização da galeria' });
    expect(within(lightbox).getByText('1 de 41')).toBeInTheDocument();
    expect(within(lightbox).getByRole('button', { name: 'Fechar galeria' })).toHaveFocus();
    await user.tab({ shift: true });
    expect(within(lightbox).getByRole('button', { name: 'Próxima foto' })).toHaveFocus();
    await user.tab();
    expect(within(lightbox).getByRole('button', { name: 'Fechar galeria' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(within(lightbox).getByText('2 de 41')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Visualização da galeria' })).not.toBeInTheDocument();
    await waitFor(() => expect(firstPhoto).toHaveFocus());
  });

  it('matches page-specific service structures instead of rendering generic sections', () => {
    const { unmount } = render(
      <MemoryRouter initialEntries={['/maquiagem']}>
        <StorefrontRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByRole('region', { name: 'Galeria de Maquiagem' })).toHaveTextContent('3 fotos');
    expect(document.querySelector('.service-detail__closing')).toHaveClass('service-detail__closing--image');

    unmount();
    render(
      <MemoryRouter initialEntries={['/manicure-pedicure']}>
        <StorefrontRoutes />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('heading', { name: 'Unhas feitas para você' })).not.toBeInTheDocument();

    unmount();
    render(
      <MemoryRouter initialEntries={['/terapia-capilar']}>
        <StorefrontRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'O que o tratamento pode proporcionar' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Casos antes e depois' })).toHaveTextContent('1 de 5');
    expect(screen.getByRole('region', { name: 'Ambiente e atendimento de terapia capilar' })).toBeInTheDocument();
  });

  it('recreates the missing certification sections and legacy footer', () => {
    const { unmount } = render(
      <MemoryRouter initialEntries={['/certificacao-internacional']}>
        <StorefrontRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'O que significa essa certificação' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'O que você ganha com nossa certificação' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Por que você deve Nos Escolher' })).toBeInTheDocument();

    unmount();
    render(
      <MemoryRouter>
        <StorefrontShell><div /></StorefrontShell>
      </MemoryRouter>,
    );
    const footer = screen.getByRole('contentinfo');
    expect(within(footer).getByRole('heading', { name: 'Endereço' })).toBeInTheDocument();
    expect(within(footer).getByRole('heading', { name: 'Contatos' })).toBeInTheDocument();
    expect(within(footer).getByText(/Todos os direitos reservados/)).toBeInTheDocument();
  });

  it('recreates the legacy certification composition and copy', () => {
    render(
      <MemoryRouter initialEntries={['/certificacao-internacional']}>
        <StorefrontRoutes />
      </MemoryRouter>,
    );

    const hero = document.querySelector('.certification-hero') as HTMLElement;
    expect(hero).toHaveClass('certification-hero--legacy');
    expect(within(hero).getByRole('img', { name: 'Selo de certificação internacional' })).toBeInTheDocument();
    expect(within(hero).getByRole('img', { name: 'Elivaldo Lima com certificados internacionais' })).toBeInTheDocument();
    expect(within(hero).getByRole('img', { name: 'Certificado oficial de homologação internacional' })).toBeInTheDocument();
    expect(within(hero).getByRole('heading', { name: 'Padrão internacional' })).toBeInTheDocument();
    expect(hero.querySelector('.certification-hero__divider')).toBeInTheDocument();
    expect(hero.querySelector('.certification-hero__lead')).toHaveTextContent(/O Salão Jonas & Elivaldo Hair Designers transforma conhecimento internacional/);
    expect(within(hero).getByText('conhecimento internacional com certificação', { exact: true })).toBeInTheDocument();
    expect(within(hero).getByText('certificação internacional em beleza', { exact: true })).toBeInTheDocument();
    expect(within(hero).getByText('os mais altos padrões globais de qualidade, cuidado e resultado', { exact: true })).toBeInTheDocument();
    expect(within(hero).getByText(/Isso significa que você está nas mãos/)).toBeInTheDocument();
    expect(hero.querySelector('.certification-hero__calendar-icon')).toBeInTheDocument();
    expect(hero.querySelector('.certification-hero__calendar-icon[data-icon="calendar-plus"].lucide')).toBeInTheDocument();

    expect(document.querySelector('.certification-meaning')).toHaveClass('certification-meaning--legacy');
    expect(document.querySelector('.certification-meaning__grid--legacy')).toBeInTheDocument();
    expect(screen.getAllByText('SAIBA', { exact: true })).toHaveLength(2);
    expect(document.querySelectorAll('.certification-meaning__card')).toHaveLength(4);
    expect(document.querySelector('.certification-exclusive')).toHaveClass('certification-exclusive--legacy');
    expect(document.querySelector('.certification-exclusive__grid--legacy')).toBeInTheDocument();
    expect(document.querySelectorAll('.certification-exclusive__card')).toHaveLength(4);
    expect(screen.getByRole('heading', { name: 'Técnicas Avançadas' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Procedimentos com Mais Precisão' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Produtos Profissionais de Alta Performance' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Atendimento com Padrão Internacional' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Certificação e especialista' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Item anterior' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Próximo item' })).toBeInTheDocument();
    expect(document.querySelector('.certification-why__copy')).toBeInTheDocument();
    expect(document.querySelector('.certification-why__media')).toBeInTheDocument();
    expect(document.querySelectorAll('.certification-why__commitment-dot')).toHaveLength(4);
    expect(document.querySelectorAll('.institutional-certification .certification-icon .lucide')).toHaveLength(8);
    expect(document.querySelectorAll('.certification-why__commitment-dot[data-icon="circle"].lucide')).toHaveLength(4);
    expect(document.querySelectorAll('.certification-why__media [data-icon="chevron-left"].lucide, .certification-why__media [data-icon="chevron-right"].lucide')).toHaveLength(2);
    expect(document.querySelectorAll('.certification-closing [data-icon].lucide')).toHaveLength(3);
    expect(screen.getByRole('heading', { name: 'Por que você deve Nos Escolher' })).toBeInTheDocument();
    expect(screen.getByText(/Aqui, cada detalhe é pensado para entregar resultado, sofisticação e excelência/)).toBeInTheDocument();
    const closing = document.querySelector('.certification-closing') as HTMLElement;
    expect(closing.style.backgroundImage).toContain('Gemini_Generated_Image_5v2yzx5v2yzx5v2y-1.png');
    expect(closing.querySelector('.service-detail__reassurance-grid article:first-child p')).not.toBeInTheDocument();
  });

  it('opens and closes the team-member popup from the legacy team cards', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/sobre-nos']}>
        <StorefrontRoutes />
      </MemoryRouter>,
    );

    const profileButton = screen.getByRole('button', { name: 'Conhecer Jonas Moreira' });
    await user.click(profileButton);
    const dialog = screen.getByRole('dialog', { name: 'Jonas Moreira' });
    expect(within(dialog).getByText('Diretor Geral e CEO')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Jonas Moreira' })).not.toBeInTheDocument();
    await waitFor(() => expect(profileButton).toHaveFocus());
  });
});
