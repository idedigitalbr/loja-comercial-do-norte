import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Icon } from '@commerce/ui';
import { Link } from 'react-router-dom';
import { InstitutionalImage, WhatsAppLink } from '../components/institutional-page-components';
import { institutionalContent } from '../content/institutional-content';
import { isSafeCtaHref, useSiteConfig } from '../content/site-config-client';

function emphasizePhrases(text: string, phrases: string[]): ReactNode[] {
  const segments: ReactNode[] = [];
  let position = 0;

  while (position < text.length) {
    const nextPhrase = phrases
      .map((phrase) => ({ phrase, index: text.indexOf(phrase, position) }))
      .filter((match) => match.index >= 0)
      .sort((left, right) => left.index - right.index)[0];

    if (!nextPhrase) {
      segments.push(text.slice(position));
      break;
    }

    if (nextPhrase.index > position) segments.push(text.slice(position, nextPhrase.index));
    segments.push(<strong key={`${nextPhrase.index}-${nextPhrase.phrase}`}>{nextPhrase.phrase}</strong>);
    position = nextPhrase.index + nextPhrase.phrase.length;
  }

  return segments;
}

function youtubeEmbedUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    const isYouTubeHost = hostname === 'youtube.com' || hostname === 'www.youtube.com' || hostname === 'm.youtube.com' || hostname === 'youtu.be' || hostname === 'www.youtube-nocookie.com';
    if (!isYouTubeHost) return null;

    const pathParts = url.pathname.split('/').filter(Boolean);
    const videoId = hostname === 'youtu.be'
      ? pathParts[0]
      : pathParts[0] === 'embed' || pathParts[0] === 'shorts'
        ? pathParts[1]
        : url.searchParams.get('v');

    return videoId && /^[a-zA-Z0-9_-]{6,}$/.test(videoId)
      ? `https://www.youtube.com/embed/${videoId}`
      : null;
  } catch {
    return null;
  }
}

export function HomePage() {
  const { about, booking, hero, images, services, shop, testimonials } = institutionalContent;
  const siteConfig = useSiteConfig();
  const remoteBanners = siteConfig?.banners ?? [];
  const [heroSlide, setHeroSlide] = useState(0);
  const [heroMessage, setHeroMessage] = useState(0);
  const [shopSlide, setShopSlide] = useState(0);
  const [animationPaused, setAnimationPaused] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const videoTriggerRef = useRef<HTMLButtonElement>(null);
  const videoCloseRef = useRef<HTMLButtonElement>(null);
  const currentRemoteBanner = remoteBanners.length ? remoteBanners[heroSlide % remoteBanners.length] : null;
  const ctaHref = isSafeCtaHref(currentRemoteBanner?.ctaHref) ? currentRemoteBanner.ctaHref : hero.videoHref;
  const ctaLabel = currentRemoteBanner?.ctaLabel || hero.videoLabel;
  const videoHref = youtubeEmbedUrl(ctaHref);

  useEffect(() => {
    if (animationPaused || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      setHeroSlide((current) => (current + 1) % (remoteBanners.length || images.heroSlideshow.length));
      setHeroMessage((current) => (current + 1) % hero.rotatingText.length);
    }, 2500);

    return () => window.clearInterval(timer);
  }, [animationPaused, hero.rotatingText.length, images.heroSlideshow.length, remoteBanners.length]);

  useEffect(() => {
    if (animationPaused || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      setShopSlide((current) => (current + 1) % images.shopGallery.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [animationPaused, images.shopGallery.length]);

  useEffect(() => {
    if (!videoOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setVideoOpen(false);
        window.requestAnimationFrame(() => videoTriggerRef.current?.focus());
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', closeOnEscape);
    window.requestAnimationFrame(() => videoCloseRef.current?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [videoOpen]);

  function closeVideo() {
    setVideoOpen(false);
    window.requestAnimationFrame(() => videoTriggerRef.current?.focus());
  }

  return (
    <main className="institutional-page institutional-home">
      <section className="institutional-home__hero" aria-labelledby="home-title">
        <div className="institutional-home__hero-backgrounds" aria-hidden="true">
          {(remoteBanners.length ? remoteBanners : images.heroSlideshow.map((desktopPath) => ({ desktopPath, mobilePath: null, id: desktopPath }))).map((banner, index) => (
            <div
              className={`institutional-home__hero-background ${index === heroSlide ? 'is-active' : ''}`}
              key={banner.id}
              style={banner.mobilePath ? { backgroundImage: `url("${banner.desktopPath}")`, '--hero-mobile-image': `url("${banner.mobilePath}")` } as CSSProperties : { backgroundImage: `url("${banner.desktopPath}")` }}
              data-mobile-image={banner.mobilePath ? 'true' : undefined}
            />
          ))}
        </div>
        <div className="institutional-home__hero-overlay" aria-hidden="true" />
        <div className="site-container institutional-home__hero-content">
          <h1 id="home-title">{currentRemoteBanner?.title || hero.title}</h1>
          <p key={heroMessage} className="institutional-home__hero-description is-active">{hero.rotatingText[heroMessage]}</p>
          {videoHref ? <button ref={videoTriggerRef} className="button button--primary institutional-home__video-trigger" type="button" aria-haspopup="dialog" onClick={() => setVideoOpen(true)}>
            <Icon name="play" size={15} strokeWidth={2.2} fill="currentColor" />
            {ctaLabel}
          </button> : ctaHref.startsWith('/') ? <Link className="button button--primary" to={ctaHref}>
            <Icon name="play" size={15} strokeWidth={2.2} fill="currentColor" />
            {ctaLabel}
          </Link> : <a className="button button--primary" href={ctaHref} target="_blank" rel="noreferrer">
            <Icon name="play" size={15} strokeWidth={2.2} fill="currentColor" />
            {ctaLabel}
          </a>}
        </div>
        <button className="institutional-home__motion-toggle" type="button" onClick={() => setAnimationPaused((current) => !current)} aria-label={animationPaused ? 'Retomar animações' : 'Pausar animações'}><Icon name={animationPaused ? 'play' : 'pause'} size={15} strokeWidth={2.2} fill={animationPaused ? 'currentColor' : undefined} /></button>
        <a className="institutional-home__scroll" href="#sobre" aria-label="Ir para a apresentação"><Icon name="arrow-down" size={20} strokeWidth={1.8} /></a>
        {videoOpen && videoHref ? <div className="institutional-video-modal" role="dialog" aria-modal="true" aria-labelledby="home-video-title" onMouseDown={(event) => { if (event.target === event.currentTarget) closeVideo(); }}>
          <div className="institutional-video-modal__dialog">
            <div className="institutional-video-modal__header"><h2 id="home-video-title">{ctaLabel}</h2><button ref={videoCloseRef} className="institutional-video-modal__close" type="button" onClick={closeVideo} aria-label="Fechar vídeo"><Icon name="x" size={22} strokeWidth={2} /></button></div>
            <div className="institutional-video-modal__frame"><iframe title={ctaLabel} src={videoHref} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>
          </div>
        </div> : null}
      </section>

      <section className="institutional-section institutional-home__about" id="sobre" aria-labelledby="home-about-label">
        <div className="site-container institutional-home__about-grid">
          <div className="institutional-copy-block institutional-home__about-copy">
            <h2 id="home-about-label" className="institutional-home__section-label">{about.eyebrow}</h2>
            <div className="institutional-home__brand-heading">
              <h2>{about.title}</h2>
              <span className="institutional-home__brand-subtitle">{about.subtitle}</span>
            </div>
            <p className="institutional-lead">{emphasizePhrases(about.summary, ['linda, confiante e renovada'])}</p>
            <p>{emphasizePhrases(about.homeDescription, ['autoestima', 'atender com qualidade', 'profissionais experientes e atualizados, produtos seguros e certificados'])}</p>
            <p>{about.homeClosing}</p>
            <Link className="button button--primary" to="/sobre-nos">Nossa História</Link>
          </div>
          <InstitutionalImage className="institutional-home__about-image" src={images.salon} alt="Jonas e Elivaldo no salão Jonas & Elivaldo Hair Designers" />
        </div>
      </section>

      <section className="institutional-section institutional-section--surface institutional-home__services" aria-labelledby="home-services-title">
        <div className="site-container">
          <h2 id="home-services-title" className="sr-only">Serviços</h2>
          <div className="institutional-service-grid">
            {services.map((service) => (
              <Link className="institutional-service-card" id={service.name === 'Eventos' ? 'eventos' : undefined} key={service.name} to={service.href}>
                <InstitutionalImage className="institutional-service-card__image" src={service.image} alt={service.imageAlt} />
                <div className="institutional-service-card__overlay" />
                <div className="institutional-service-card__content">
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="institutional-home__shop" aria-labelledby="home-shop-title">
        <div className="institutional-home__shop-grid">
          <div className="institutional-home__shop-image-panel" aria-hidden="true">
            {images.shopGallery.map((src, index) => <div className={`institutional-home__shop-background ${index === shopSlide ? 'is-active' : ''}`} key={src} style={{ backgroundImage: `url("${src}")` }} />)}
          </div>
          <div className="institutional-home__shop-copy">
            <h2 id="home-shop-title" className="institutional-home__section-label">{shop.eyebrow}</h2>
            <div className="institutional-home__shop-title">
              {shop.title.map((line) => <h2 key={line}>{line}</h2>)}
            </div>
            <Link className="button button--dark" to="/loja">{shop.buttonLabel}</Link>
          </div>
        </div>
      </section>

      <section className="institutional-home__feature institutional-home__feature--hair" aria-labelledby="hair-booking-title">
        <div className="site-container institutional-home__feature-grid">
          <InstitutionalImage className="institutional-home__feature-image" src={images.hairBooking} alt={booking.hair.imageAlt} />
          <div className="institutional-home__feature-copy">
            <h2 className="institutional-home__section-label">{booking.hair.eyebrow}</h2>
            <h3 id="hair-booking-title">{emphasizePhrases(booking.hair.title, ['bem cuidados'])}</h3>
            {booking.hair.paragraphs.map((paragraph, index) => <p key={paragraph}>{index === 1 ? emphasizePhrases(paragraph, ['Reserve seu horário']) : paragraph}</p>)}
            <WhatsAppLink>chame no whatsapp</WhatsAppLink>
          </div>
        </div>
      </section>

      <section className="institutional-home__feature institutional-home__feature--nails" aria-labelledby="nails-booking-title">
        <div className="site-container institutional-home__feature-grid institutional-home__feature-grid--reverse">
          <div className="institutional-home__feature-copy">
            <h2 className="institutional-home__section-label">{booking.nails.eyebrow}</h2>
            <h3 id="nails-booking-title">{booking.nails.title}</h3>
            {booking.nails.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <WhatsAppLink>chame no whatsapp</WhatsAppLink>
          </div>
          <InstitutionalImage className="institutional-home__feature-image" src={images.nailsBooking} alt={booking.nails.imageAlt} />
        </div>
      </section>

      <section className="institutional-section institutional-home__testimonials" aria-labelledby="home-testimonials-title">
        <div className="site-container">
          <div className="institutional-testimonial__heading">
            <div className="institutional-testimonial__rating" role="img" aria-label="Classificado como 5 de 5">{Array.from({ length: 5 }, (_, index) => <Icon key={index} name="star" size={16} strokeWidth={1.5} fill="currentColor" />)}</div>
            <h2 id="home-testimonials-title">Depoimentos de Nossos Clientes</h2>
          </div>

          <div className="institutional-testimonial-row institutional-testimonial-row--ana">
            <InstitutionalImage
              className="institutional-testimonial__image"
              src={images.testimonialSideLeft}
              alt="Ambiente do salão para depoimento de cliente"
            />

            <article className="institutional-testimonial institutional-testimonial--ana">
              <div className="institutional-testimonial__quote-mark" aria-hidden="true">“</div>
              <div className="institutional-testimonial__content">
                <h3>“{testimonials[0].quote}”</h3>
                <p>{testimonials[0].body}</p>
              </div>
              <div className="institutional-testimonial__footer">
                <span aria-hidden="true" />
                <p>{testimonials[0].author}</p>
              </div>
            </article>

            <InstitutionalImage
              className="institutional-testimonial__image"
              src={images.testimonialSideRight}
              alt="Atendimento do salão para depoimento de cliente"
            />
          </div>

          <div className="institutional-testimonial-showcase">
            <article className="institutional-testimonial institutional-testimonial--patricia">
              <div className="institutional-testimonial__quote-mark" aria-hidden="true">“</div>
              <div className="institutional-testimonial__content">
                <h3>“{testimonials[1].quote}”</h3>
                <p>{testimonials[1].body}</p>
              </div>
              <div className="institutional-testimonial__footer">
                <span aria-hidden="true" />
                <p>{testimonials[1].author}</p>
              </div>
            </article>

            <InstitutionalImage
              className="institutional-testimonial__image"
              src={images.testimonial}
              alt="Cliente do Jonas & Elivaldo Hair Designers"
            />

            <article className="institutional-testimonial institutional-testimonial--camila">
              <div className="institutional-testimonial__quote-mark" aria-hidden="true">“</div>
              <div className="institutional-testimonial__content">
                <h3>“{testimonials[2].quote}”</h3>
                <p>{testimonials[2].body}</p>
              </div>
              <div className="institutional-testimonial__footer">
                <span aria-hidden="true" />
                <p>{testimonials[2].author}</p>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
