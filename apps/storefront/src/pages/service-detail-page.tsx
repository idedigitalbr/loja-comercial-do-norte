import { useEffect, useRef, useState } from 'react';
import { Icon, type IconName } from '@commerce/ui';
import { InstitutionalImage, WhatsAppLink } from '../components/institutional-page-components';
import { LegacyCarousel, ProgressiveGallery } from '../components/legacy-media-components';
import { servicePages, type ServicePageData, type ServicePageSlug } from '../content/service-pages-content';

const reassurance = [
  { icon: 'sliders-horizontal' as IconName, title: 'Atendimento Personalizado', description: 'Cada cliente recebe uma avaliação para encontrar o cuidado ideal para seu rosto, fios, mãos ou pés.' },
  { icon: 'badge-check' as IconName, title: 'Profissionais Qualificados', description: 'Equipe preparada com técnicas modernas para garantir um resultado bonito e seguro.' },
  { icon: 'heart-handshake' as IconName, title: 'Mais Beleza e Autoestima', description: 'Um resultado pensado para valorizar sua beleza e aumentar sua confiança.' },
];

type TherapyCaseSlide = NonNullable<ServicePageData['beforeAfter']>[number];
type TherapyWhySlide = NonNullable<ServicePageData['whyChooseGallery']>[number];

function getTherapyVisibleItemCount() {
  if (typeof window === 'undefined' || window.innerWidth <= 900) return 1;
  if (window.innerWidth <= 1440) return 2;
  return 4;
}

function TherapyCaseCarousel({ cases }: { cases: TherapyCaseSlide[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState(getTherapyVisibleItemCount);
  const pointerStart = useRef<number | null>(null);
  const caseCount = Math.max(1, cases.length);
  const itemCount = Math.max(1, Math.min(visibleItems, caseCount));
  const trackCases = [...cases, ...cases.slice(0, itemCount - 1)];

  useEffect(() => {
    const updateVisibleItems = () => {
      setVisibleItems(getTherapyVisibleItemCount());
    };
    window.addEventListener('resize', updateVisibleItems);
    return () => window.removeEventListener('resize', updateVisibleItems);
  }, []);

  const previous = () => setActiveIndex((index) => (index - 1 + caseCount) % caseCount);
  const next = () => setActiveIndex((index) => (index + 1) % caseCount);

  return (
    <div
      className="therapy-case-carousel"
      role="region"
      aria-roledescription="carrossel"
      aria-label="Resultados da Terapia Capilar"
      data-active-index={activeIndex}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') { event.preventDefault(); previous(); }
        if (event.key === 'ArrowRight') { event.preventDefault(); next(); }
      }}
      onPointerDown={(event) => { pointerStart.current = event.clientX; }}
      onPointerUp={(event) => {
        if (pointerStart.current === null) return;
        const distance = event.clientX - pointerStart.current;
        pointerStart.current = null;
        if (Math.abs(distance) < 40) return;
        if (distance > 0) previous(); else next();
      }}
    >
      <div
        className="therapy-case-carousel__track"
        style={{
          width: `${(trackCases.length / itemCount) * 100}%`,
          transform: `translateX(-${(activeIndex * 100) / trackCases.length}%)`,
        }}
      >
        {trackCases.map((item, index) => {
          const clone = index >= cases.length;
          return (
            <figure
              className={`service-detail__before-after-case${clone ? ' service-detail__before-after-case--clone' : ''}`}
              key={`${item.src}-${index}`}
              aria-hidden={clone || undefined}
              style={{ flex: `0 0 ${100 / trackCases.length}%` }}
            >
              <InstitutionalImage src={item.src} alt={item.alt} />
              {item.caption ? <figcaption>{item.caption}</figcaption> : null}
            </figure>
          );
        })}
      </div>
      <button type="button" className="therapy-case-carousel__control therapy-case-carousel__control--previous" onClick={previous} aria-label="Caso anterior">
        <Icon name="chevron-left" size={22} strokeWidth={1.8} />
      </button>
      <button type="button" className="therapy-case-carousel__control therapy-case-carousel__control--next" onClick={next} aria-label="Próximo caso">
        <Icon name="chevron-right" size={22} strokeWidth={1.8} />
      </button>
      <div className="therapy-case-carousel__pagination" aria-label="Selecionar resultado">
        {cases.map((item, index) => (
          <button
            key={item.src}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Ir para caso ${index + 1}`}
            aria-pressed={activeIndex === index}
          />
        ))}
      </div>
    </div>
  );
}

function TherapyWhyCarousel({ images }: { images: TherapyWhySlide[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const pointerStart = useRef<number | null>(null);
  const imageCount = Math.max(1, images.length);
  const previous = () => setActiveIndex((index) => (index - 1 + imageCount) % imageCount);
  const next = () => setActiveIndex((index) => (index + 1) % imageCount);

  return (
    <div
      className="service-detail__why-gallery"
      role="region"
      aria-roledescription="carrossel"
      aria-label="Ambiente e atendimento de terapia capilar"
      data-active-index={activeIndex}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') { event.preventDefault(); previous(); }
        if (event.key === 'ArrowRight') { event.preventDefault(); next(); }
      }}
      onPointerDown={(event) => { pointerStart.current = event.clientX; }}
      onPointerUp={(event) => {
        if (pointerStart.current === null) return;
        const distance = event.clientX - pointerStart.current;
        pointerStart.current = null;
        if (Math.abs(distance) < 40) return;
        if (distance > 0) previous(); else next();
      }}
    >
      <div className="service-detail__why-track" style={{ transform: `translateX(-${activeIndex * 50}%)` }}>
        {images.map((image, index) => (
          <figure className="service-detail__why-slide" key={image.src} aria-hidden={activeIndex !== index}>
            <InstitutionalImage className="service-detail__why-image" src={image.src} alt={image.alt} />
          </figure>
        ))}
      </div>
      <button type="button" className="therapy-case-carousel__control therapy-case-carousel__control--previous" onClick={previous} aria-label="Slide anterior">
        <Icon name="chevron-left" size={22} strokeWidth={1.8} />
      </button>
      <button type="button" className="therapy-case-carousel__control therapy-case-carousel__control--next" onClick={next} aria-label="Próximo slide">
        <Icon name="chevron-right" size={22} strokeWidth={1.8} />
      </button>
      <div className="therapy-case-carousel__pagination" aria-label="Selecionar imagem institucional">
        {images.map((image, index) => (
          <button
            key={image.src}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Ir para o slide ${index + 1}`}
            aria-pressed={activeIndex === index}
          />
        ))}
      </div>
    </div>
  );
}

export function ServiceDetailPage({ slug }: { slug: ServicePageSlug }) {
  const page = servicePages[slug];
  const reassuranceItems = page.reassurance ?? reassurance;

  return (
    <main className={`institutional-page service-detail service-detail--${page.slug}`}>
      <section className="service-detail__hero" style={{ backgroundImage: `url("${page.heroImage}")` }} aria-labelledby="service-detail-title">
        <div className="service-detail__hero-overlay" />
        <div className="site-container service-detail__hero-content">
          <p className="service-detail__hero-eyebrow">Serviço</p>
          <h1 id="service-detail-title">{page.title}</h1>
          <a className="button button--primary" href="#service-intro">
            <span className="service-detail__hero-button-content">
              Saiba mais
              <svg className="service-detail__hero-arrow" width="14" height="14" viewBox="0 0 448 512" fill="currentColor" aria-hidden="true" focusable="false" data-icon="arrow-down">
                <path d="M413.1 222.5l22.2 22.2c9.4 9.4 9.4 24.6 0 33.9L241 473c-9.4 9.4-24.6 9.4-33.9 0L12.7 278.6c-9.4-9.4-9.4-24.6 0-33.9l22.2-22.2c9.5-9.5 25-9.3 34.3.4L184 343.4V56c0-13.3 10.7-24 24-24h32c13.3 0 24 10.7 24 24v287.4l114.8-120.5c9.3-9.8 24.8-10 34.3-.4z" />
              </svg>
            </span>
          </a>
        </div>
      </section>

      <section className="service-detail__intro" id="service-intro" aria-labelledby="service-intro-title">
        <div className="site-container service-detail__intro-grid">
          <div className="service-detail__intro-copy">
            <p className="service-detail__eyebrow">SOBRE NOSSO SERVIÇO</p>
            <h2 id="service-intro-title">{page.intro.title}</h2>
            {page.intro.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {page.intro.noteTitle ? <p className="service-detail__intro-note-title">{page.intro.noteTitle}</p> : null}
            {page.intro.note ? (
              Array.isArray(page.intro.note)
                ? page.intro.note.map((paragraph, index) => <p key={`intro-note-${index}`}>{paragraph}</p>)
                : <p>{page.intro.note}</p>
            ) : null}
            <WhatsAppLink className="button button--primary">Chame no WhatsApp</WhatsAppLink>
          </div>
          <div className="service-detail__intro-collage" aria-label={`Imagens de ${page.title}`}>
            {page.intro.images.map((image) => <InstitutionalImage className="service-detail__intro-image" key={image.src} src={image.src} alt={image.alt} />)}
          </div>
        </div>
      </section>

      {page.process ? (
        <section className="service-detail__process" aria-labelledby="service-process-title">
          <div className="site-container">
            <div className="service-detail__section-heading">
              <p className="service-detail__eyebrow">{page.process.eyebrow}</p>
              <h2 id="service-process-title">{page.process.title}</h2>
            </div>
            <ol className="service-detail__process-grid">
              {page.process.steps.map((step) => (
                <li key={step.number}>
                  <span>{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      <section className="service-detail__solutions" aria-labelledby="service-solutions-title">
        <div className="site-container">
          <div className="service-detail__section-heading">
            <p className="service-detail__eyebrow">{page.solutions.eyebrow}</p>
            <h2 id="service-solutions-title">{page.solutions.title}</h2>
            {page.solutions.description ? <p>{page.solutions.description}</p> : null}
          </div>
          <div className={`service-detail__solution-grid service-detail__solution-grid--${page.solutions.items.length}`}>
            {page.solutions.items.map((solution, index) => (
              <article className={`service-detail__solution-card service-detail__solution-card--${index % 2 ? 'amber' : 'yellow'}`} key={solution.title}>
                <div className="service-detail__solution-visual">
                  <InstitutionalImage className="service-detail__solution-image" src={solution.image.src} alt={solution.image.alt} />
                  <div className="service-detail__solution-overlay" />
                  <h3>{solution.title}</h3>
                </div>
                <div className="service-detail__solution-body">
                  <p>{solution.description}</p>
                  {solution.bullets ? <ul>{solution.bullets.map((bullet) => <li key={bullet}><Icon name="check" size={14} strokeWidth={2.2} />{bullet}</li>)}</ul> : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {page.slug === 'terapia-capilar' && page.benefits && page.beforeAfter ? (
        <section className="service-detail__results service-detail__results--therapy" aria-labelledby="service-results-title">
          <div className="site-container service-detail__therapy-results-grid">
            <div className="service-detail__therapy-results-copy">
              <div className="service-detail__section-heading">
                <p className="service-detail__eyebrow">{page.benefits.eyebrow}</p>
                <h2 id="service-results-title">{page.results.title}</h2>
              </div>
              <ul className="service-detail__therapy-benefits">
                {page.benefits.items.map((item) => (
                  <li key={item.title}>
                    <Icon name={item.icon} size={22} strokeWidth={1.7} />
                    <span>{item.title}</span>
                  </li>
                ))}
              </ul>
            </div>
            <TherapyCaseCarousel cases={page.beforeAfter} />
          </div>
        </section>
      ) : null}

      {page.gallery ? (
        <ProgressiveGallery
          title={page.title}
          eyebrow={page.results.eyebrow}
          description={page.results.description}
          images={page.gallery.images}
          initialCount={page.gallery.initialCount}
        />
      ) : !page.hideResults ? <section className="service-detail__results" aria-labelledby="service-results-title">
        <div className="site-container">
          <div className="service-detail__section-heading service-detail__section-heading--centered">
            <p className="service-detail__eyebrow">{page.results.eyebrow}</p>
            <h2 id="service-results-title">{page.results.title}</h2>
            <p>{page.results.description}</p>
          </div>
          <div className={`service-detail__results-grid service-detail__results-grid--${page.results.images.length}`}>
            {page.results.images.map((image) => <InstitutionalImage className="service-detail__result-image" key={image.src} src={image.src} alt={image.alt} />)}
          </div>
        </div>
      </section> : null}

      {page.whyChoose && page.whyChooseGallery ? (
        <section className="service-detail__why" aria-labelledby="service-why-title">
          <div className="site-container service-detail__why-grid">
            <div className="service-detail__why-copy">
              <p className="service-detail__eyebrow">{page.whyChoose.eyebrow}</p>
              <h2 id="service-why-title">{page.whyChoose.title}</h2>
              <p className="service-detail__why-description">{page.whyChoose.description}</p>
              <ul>
                {page.whyChoose.items.map((item) => (
                  <li key={item}>
                    <Icon name="check" size={18} strokeWidth={2} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <TherapyWhyCarousel images={page.whyChooseGallery} />
          </div>
        </section>
      ) : null}

      <section
        className={`service-detail__closing${page.closingImage ? ' service-detail__closing--image' : ''}`}
        style={page.closingImage ? { backgroundImage: `url("${page.closingImage}")` } : undefined}
        aria-labelledby="service-closing-title"
      >
        {page.closingImage ? <div className="service-detail__closing-overlay" aria-hidden="true" /> : null}
        <div className="site-container service-detail__closing-content">
          <p className="service-detail__eyebrow">{page.closingEyebrow ?? 'Entre em contato'}</p>
          <h2 id="service-closing-title">{page.ctaTitle}</h2>
          {page.closingDescription ? <p className="service-detail__closing-description">{page.closingDescription}</p> : null}
          <WhatsAppLink className="button button--primary">
            {page.closingCtaLabel ?? 'Agende seu atendimento'}
          </WhatsAppLink>
          <div className="service-detail__reassurance-grid">
            {reassuranceItems.map((item) => (
              <article key={item.title}>
                <Icon name={item.icon} size={22} strokeWidth={1.8} />
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
