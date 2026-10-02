import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { StorefrontShell } from '../components/storefront-shell';
import { LegacyCarousel } from '../components/legacy-media-components';
import { SiteConfigContext, type PublicSiteConfig } from '../content/site-config-client';
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

  it('sends the legacy Events URL to the real Events card on the home page', () => {
    render(
      <MemoryRouter initialEntries={['/servicos#eventos']}>
        <StorefrontRoutes />
      </MemoryRouter>,
    );

    expect(document.getElementById('eventos')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Eventos Conheça nossos Pacotes de Eventos/ })).toHaveAttribute('href', '/servicos#eventos');
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

    const homeSections = [...document.querySelectorAll('.institutional-home > section')];
    expect(homeSections.map((section) => section.classList[0])).toEqual([
      'institutional-home__hero',
      'institutional-section',
      'institutional-section',
      'institutional-home__shop',
      'institutional-home__feature',
      'institutional-home__feature',
      'institutional-section',
    ]);
    expect(document.querySelector('.institutional-home__salon-gallery')).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Galeria do salão' })).not.toBeInTheDocument();

    const shop = document.querySelector('.institutional-home__shop') as HTMLElement;
    const shopSlides = shop.querySelectorAll('.institutional-home__shop-background');
    expect(shopSlides).toHaveLength(9);
    expect(shopSlides[0]).toHaveClass('is-active');
    expect(shop.querySelector('.institutional-home__shop-copy')).toBeInTheDocument();
  });

  it('rotates the three original hero messages when remote banner settings are present', () => {
    vi.useFakeTimers();
    const siteConfig: PublicSiteConfig = {
      site: { siteName: 'Jonas & Elivaldo', logoPath: null, faviconPath: null, address: null, phone: null, whatsapp: null, instagramUrl: null, title: null, description: null },
      banners: [{ id: 'banner-home', desktopPath: '/banner.webp', mobilePath: null, eyebrow: null, title: null, description: 'Texto fixo do banner', ctaLabel: null, ctaHref: null, sortOrder: 0 }],
    };

    render(
      <SiteConfigContext.Provider value={siteConfig}>
        <MemoryRouter initialEntries={['/']}>
          <StorefrontRoutes />
        </MemoryRouter>
      </SiteConfigContext.Provider>,
    );

    expect(document.querySelector('.institutional-home__hero-description')).toHaveTextContent('Especialistas em cabelos e unhas, com atendimento de qualidade');
    expect(document.querySelector('.institutional-home__hero-description')).toHaveClass('is-active');

    act(() => vi.advanceTimersByTime(2500));
    expect(document.querySelector('.institutional-home__hero-description')).toHaveTextContent('e aquele cuidado que você merece.');

    act(() => vi.advanceTimersByTime(2500));
    expect(document.querySelector('.institutional-home__hero-description')).toHaveTextContent('Agende já e venha se sentir ainda mais linda!');
  });

  it('uses the original compact home presentation instead of repeating the history page', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <StorefrontRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByText('Nosso objetivo é fazer você se sentir linda, confiante e renovada sempre que nos visitar.')).toBeInTheDocument();
    expect(screen.getByText(/Mais do que um salão, somos especialistas em cuidar da sua autoestima/)).toBeInTheDocument();
    expect(screen.getByText('Venha viver essa experiência transformadora.')).toBeInTheDocument();
    expect(screen.queryByText(/A história do Jonas & Elivaldo Hair Designers começou com um sonho/)).not.toBeInTheDocument();
  });

  it('matches the five image panels shown in the current history page', () => {
    render(
      <MemoryRouter initialEntries={['/sobre-nos']}>
        <StorefrontRoutes />
      </MemoryRouter>,
    );

    const panels = document.querySelector('.institutional-about__values-grid');
    expect(panels?.querySelectorAll('img')).toHaveLength(5);
    expect(within(panels as HTMLElement).queryByRole('heading', { name: 'Missão' })).not.toBeInTheDocument();
    expect(within(panels as HTMLElement).queryByRole('heading', { name: 'Visão' })).not.toBeInTheDocument();
    expect(within(panels as HTMLElement).queryByRole('heading', { name: 'Valores' })).not.toBeInTheDocument();
  });

  it('uses Lucide icons for institutional actions and reassurance cards', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <StorefrontRoutes />
      </MemoryRouter>,
    );

    expect(document.querySelector('.institutional-home__hero [data-icon="play"].lucide')).toBeInTheDocument();
    expect(document.querySelector('.institutional-home__motion-toggle [data-icon="pause"].lucide')).toBeInTheDocument();
    expect(document.querySelector('.institutional-home__scroll [data-icon="arrow-down"].lucide')).toBeInTheDocument();
    expect(document.querySelectorAll('.institutional-testimonial__rating [data-icon="star"].lucide')).toHaveLength(5);

    render(
      <MemoryRouter initialEntries={['/cabelos-e-penteados']}>
        <StorefrontRoutes />
      </MemoryRouter>,
    );

    expect(document.querySelector('.service-detail__hero [data-icon="arrow-down"]')).toBeInTheDocument();
    expect(document.querySelectorAll('.service-detail__reassurance-grid [data-icon].lucide')).toHaveLength(3);
    expect(document.querySelectorAll('.service-detail__solution-body li [data-icon="check"].lucide').length).toBeGreaterThan(0);
    expect(document.querySelectorAll('.service-detail__solution-body li').length).toBeGreaterThan(0);
  });

  it('opens the home banner YouTube CTA in an accessible modal', async () => {
    const user = userEvent.setup();
    const siteConfig: PublicSiteConfig = {
      site: { siteName: 'Jonas & Elivaldo', logoPath: null, faviconPath: null, address: null, phone: null, whatsapp: null, instagramUrl: null, title: null, description: null },
      banners: [{ id: 'banner-video', desktopPath: '/banner.webp', mobilePath: null, eyebrow: 'Jonas & Elivaldo', title: 'Banner com vídeo', description: 'Assista à experiência.', ctaLabel: 'ASSISTA NOSSO VÍDEO', ctaHref: 'https://www.youtube.com/watch?v=abc123', sortOrder: 0 }],
    };
    render(
      <SiteConfigContext.Provider value={siteConfig}>
        <MemoryRouter initialEntries={['/']}>
          <StorefrontRoutes />
        </MemoryRouter>
      </SiteConfigContext.Provider>,
    );

    await user.click(screen.getByRole('button', { name: 'ASSISTA NOSSO VÍDEO' }));

    expect(screen.getByRole('dialog', { name: 'ASSISTA NOSSO VÍDEO' })).toBeInTheDocument();
    expect(screen.getByTitle('ASSISTA NOSSO VÍDEO')).toHaveAttribute('src', 'https://www.youtube.com/embed/abc123');

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'ASSISTA NOSSO VÍDEO' })).not.toBeInTheDocument();
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

    expect(document.querySelectorAll('.institutional-about__values-photo')).toHaveLength(5);
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
    expect(document.querySelectorAll('.institutional-about__values-photo')).toHaveLength(5);
    expect(screen.queryByRole('heading', { name: 'Missão' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Visão' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Valores' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Nossa Equipe' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Jonas Moreira' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Heloísa Dias' })).toBeInTheDocument();
    expect(screen.getByText('Júnior Bessa')).toBeInTheDocument();
    expect(document.querySelectorAll('.institutional-about__value-icon[data-icon].lucide')).toHaveLength(0);
  });

  it('redirects the aggregate /servicos path to the home page', () => {
    function LocationProbe() {
      const location = useLocation();
      return <output data-testid="location-path">{location.pathname}</output>;
    }

    render(
      <MemoryRouter initialEntries={['/servicos']}>
        <StorefrontRoutes />
        <LocationProbe />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Você linda todos os dias' })).toBeInTheDocument();
    expect(screen.getByTestId('location-path')).toHaveTextContent('/');
  });

  it('renders the certification call to action', () => {
    render(
      <MemoryRouter initialEntries={['/certificacao-internacional']}>
        <StorefrontRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Verificar certificação' })).toHaveAttribute('href', 'https://cnbs.com.br/produto/elivaldo-lima-barreto/');
    expect(screen.getByText('Técnicas Avançadas')).toBeInTheDocument();
  });

  it.each([
    ['/cabelos-e-penteados', 'Cabelos & Penteados', 'Corte Feminino', 'Cabelos bem cuidados, Autoestima lá em cima!', 2, 'Chame no WhatsApp'],
    ['/maquiagem', 'Maquiagem', 'Make Express', 'Realce sua beleza com uma maquiagem profissional para cada ocasião', 2, 'Chame no WhatsApp'],
    ['/manicure-pedicure', 'Manicure & Pedicure', 'Pacote Completo', 'Unhas bem cuidadas, autoestima lá em cima!', 2, 'Chame no WhatsApp'],
    ['/terapia-capilar', 'Terapia Capilar', 'Terapia Capilar Avançada', 'Sofrendo com queda de cabelo ou problemas no couro cabeludo?', 1, 'Agende seu atendimento.'],
  ] as const)('recreates the legacy service page structure at %s', (path, title, solution, lead, expectedWhatsAppLinks, closingCta) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <StorefrontRoutes />
      </MemoryRouter>,
    );

    expect(screen.getAllByRole('heading', { name: title })[0]).toBeInTheDocument();
    expect(screen.getByText(lead)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: solution })).toBeInTheDocument();
    const heroMoreLink = screen.getByRole('link', { name: /saiba mais/i });
    expect(heroMoreLink.querySelector('svg[data-icon="arrow-down"]')).toBeInTheDocument();
    const whatsappLinks = screen.getAllByRole('link', { name: /chame no whatsapp/i });
    expect(whatsappLinks).toHaveLength(expectedWhatsAppLinks);
    expect(whatsappLinks[0]).toHaveAttribute('href', 'https://wa.me/5596981001897');
    expect(screen.getAllByRole('link', { name: closingCta }).at(-1)).toHaveAttribute('href', 'https://wa.me/5596981001897');
    expect(screen.getByRole('heading', { name: 'Atendimento Personalizado' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Saiba mais/i })).toHaveAttribute('href', '#service-intro');
  });

  it('uses the original makeup introduction copy', () => {
    render(
      <MemoryRouter initialEntries={['/maquiagem']}>
        <StorefrontRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByText(/aqui\s+cada maquiagem é feita com atenção aos detalhes/i)).toBeInTheDocument();
    expect(screen.queryByText(/aqui cuidamos da pele com atenção aos detalhes/i)).not.toBeInTheDocument();
    expect(screen.getByText('Agende seu horário e venha viver uma experiência pensada para destacar seus traços e deixar você ainda mais confiante para qualquer ocasião.')).toBeInTheDocument();
  });

  it('uses the original hair introduction copy without added punctuation', () => {
    render(
      <MemoryRouter initialEntries={['/cabelos-e-penteados']}>
        <StorefrontRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByText('Tá na hora de dar aquele trato no visual? Corte, hidratação, escova ou aquela mudança que você vem pensando aqui a gente faz com carinho, técnica e atenção aos detalhes.')).toBeInTheDocument();
    expect(screen.queryByText(/pensando — aqui a gente faz/)).not.toBeInTheDocument();
  });

  it('maps manicure artwork in the same order as the original page', () => {
    render(
      <MemoryRouter initialEntries={['/manicure-pedicure']}>
        <StorefrontRoutes />
      </MemoryRouter>,
    );

    const images = [...document.querySelectorAll<HTMLImageElement>('.service-detail__solutions .service-detail__solution-image')];
    const introImages = [...document.querySelectorAll<HTMLImageElement>('.service-detail__intro-image')];

    expect(introImages.map((image) => image.getAttribute('src')?.split('/').pop())).toEqual([
      'image-1-3.jpg',
      'image-6-1.jpg',
    ]);
    expect(images).toHaveLength(8);
    expect(images.map((image) => image.getAttribute('src')?.split('/').pop())).toEqual([
      'image-6-1.jpg',
      'IMG_6718-scaled.jpg',
      'image-4-1.jpg',
      'IMG_6727-scaled.jpg',
      'Gemini_Generated_Image_7a7q2f7a7q2f7a7q-1.png',
      'a111.jpg',
      'IMG_5562-1-scaled.jpg',
      'gell.webp',
    ]);
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

  it('exposes the four service pages from the opened desktop navigation', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <StorefrontShell><StorefrontRoutes /></StorefrontShell>
      </MemoryRouter>,
    );

    const primaryNavigation = within(screen.getByRole('navigation', { name: 'Navegação principal' }));
    await user.click(primaryNavigation.getByRole('button', { name: 'Serviços' }));
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

  it('matches page-specific service structures instead of rendering generic sections', async () => {
    const user = userEvent.setup();
    const makeupView = render(
      <MemoryRouter initialEntries={['/maquiagem']}>
        <StorefrontRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByRole('region', { name: 'Galeria de Maquiagem' })).toHaveTextContent('3 fotos');
    expect(document.querySelector('.service-detail__closing')).toHaveClass('service-detail__closing--image');

    makeupView.unmount();
    const manicureView = render(
      <MemoryRouter initialEntries={['/manicure-pedicure']}>
        <StorefrontRoutes />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('heading', { name: 'Unhas feitas para você' })).not.toBeInTheDocument();

    manicureView.unmount();
    render(
      <MemoryRouter initialEntries={['/terapia-capilar']}>
        <StorefrontRoutes />
      </MemoryRouter>,
    );
    const results = document.querySelector('.service-detail__results--therapy') as HTMLElement;
    const whyChoose = document.querySelector('.service-detail__why') as HTMLElement;
    const therapyIntro = document.querySelector('.service-detail__intro-copy') as HTMLElement;
    const cases = results.querySelectorAll('figure.service-detail__before-after-case:not(.service-detail__before-after-case--clone)');

    expect(within(therapyIntro).getByText('SOBRE NOSSO SERVIÇO')).toBeInTheDocument();
    const specialistTitle = within(therapyIntro).getByText('Sobre o Especialista:');
    expect(specialistTitle).toBeInTheDocument();
    expect(specialistTitle.tagName).toBe('P');
    expect(within(therapyIntro).getByText('Jonas Moreira é Terapeuta Capilar formado pela Academia Brasileira de Tricologia, com especialização em saúde do couro cabeludo.')).toBeInTheDocument();
    expect(within(therapyIntro).getByText('Com atendimento individualizado e protocolos personalizados, Jonas trata queda, inflamações e desequilíbrios capilares com técnicas de alta eficácia e abordagem integrativa.')).toBeInTheDocument();
    expect(within(results).getByRole('heading', { name: 'Resultados e Benefícios do Tratamento' })).toBeInTheDocument();
    expect(within(results).getAllByRole('listitem')).toHaveLength(6);
    expect(cases).toHaveLength(5);
    expect(cases[0]).toHaveTextContent('ANTES');
    expect(cases[1]).toHaveTextContent('DEPOIS');
    expect(cases[2]).not.toHaveTextContent(/ANTES|DEPOIS/);
    expect(cases[3]).not.toHaveTextContent(/ANTES|DEPOIS/);
    expect(cases[4]).not.toHaveTextContent(/ANTES|DEPOIS/);
    expect(cases[0].querySelector('img')).toHaveAttribute('src', expect.stringContaining('/capilar-7.jpg'));
    expect(cases[1].querySelector('img')).toHaveAttribute('src', expect.stringContaining('/capilar-9.jpg'));
    expect(cases[2].querySelector('img')).toHaveAttribute('src', expect.stringContaining('/capilar-5.jpg'));
    expect(cases[3].querySelector('img')).toHaveAttribute('src', expect.stringContaining('/capilar-8.jpg'));
    expect(cases[4].querySelector('img')).toHaveAttribute('src', expect.stringContaining('/Gemini_Generated_Image_1zjcl1zjcl1zjcl1-1.png'));
    expect(within(results).getAllByRole('listitem').every((item) => item.querySelector('svg'))).toBe(true);
    const resultsCarousel = within(results).getByRole('region', { name: 'Resultados da Terapia Capilar' });
    expect(resultsCarousel).toHaveAttribute('data-active-index', '0');
    await user.click(within(resultsCarousel).getByRole('button', { name: 'Próximo caso' }));
    expect(resultsCarousel).toHaveAttribute('data-active-index', '1');
    expect(within(whyChoose).getByRole('heading', { name: /Por que você deve\s+Nos Escolher/i })).toBeInTheDocument();
    expect(within(whyChoose).getByText(/nossa equipe está sempre se atualizando por meio de cursos, certificações e eventos/i)).toBeInTheDocument();
    const whyCarousel = within(whyChoose).getByRole('region', { name: 'Ambiente e atendimento de terapia capilar' });
    expect(whyCarousel).toHaveAttribute('data-active-index', '0');
    await user.click(within(whyCarousel).getByRole('button', { name: 'Próximo slide' }));
    expect(whyCarousel).toHaveAttribute('data-active-index', '1');
    const whyImages = whyChoose.querySelectorAll('.service-detail__why-image');
    expect(whyImages).toHaveLength(2);
    expect(whyImages[0]).toHaveAttribute('src', expect.stringContaining('institucional-jonas-elivaldo-evento-dupla-aromaterapia.webp'));
    expect(whyImages[1]).toHaveAttribute('src', expect.stringContaining('institucional-jonas-elivaldo-evento-aromaterapia.webp'));
    const therapyClosing = screen.getByRole('heading', { name: 'Quer recuperar a saúde do seu cabelo?' }).closest('.service-detail__closing') as HTMLElement;
    expect(within(therapyClosing).getByText('Agende sua avaliação capilar e descubra a causa da queda ou enfraquecimento dos seus fios.')).toBeInTheDocument();
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

  it('uses the complete name, role and biography inside the team popup', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/sobre-nos']}>
        <StorefrontRoutes />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'Conhecer Marisa Brito' }));
    const dialog = screen.getByRole('dialog', { name: 'Marisa Brito Barbosa' });
    expect(within(dialog).getByText('Manicure e Pedicure')).toBeInTheDocument();
    expect(within(dialog).getByText(/Amo a minha profissão e considero muito gratificante/)).toBeInTheDocument();
  });
});
