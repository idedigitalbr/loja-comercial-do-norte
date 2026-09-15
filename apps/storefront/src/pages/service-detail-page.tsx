import { Icon, type IconName } from '@commerce/ui';
import { InstitutionalImage, WhatsAppLink } from '../components/institutional-page-components';
import { LegacyCarousel, ProgressiveGallery } from '../components/legacy-media-components';
import { servicePages, ServicePageSlug } from '../content/service-pages-content';

const reassurance = [
  { icon: 'sliders-horizontal' as IconName, title: 'Atendimento Personalizado', description: 'Cada cliente recebe uma avaliação para encontrar o cuidado ideal para seu rosto, fios, mãos ou pés.' },
  { icon: 'badge-check' as IconName, title: 'Profissionais Qualificados', description: 'Equipe preparada com técnicas modernas para garantir um resultado bonito e seguro.' },
  { icon: 'heart-handshake' as IconName, title: 'Mais Beleza e Autoestima', description: 'Um resultado pensado para valorizar sua beleza e aumentar sua confiança.' },
];

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
          <a className="button button--primary" href="#service-intro">Saiba mais <Icon name="arrow-down" size={16} strokeWidth={2} /></a>
        </div>
      </section>

      <section className="service-detail__intro" id="service-intro" aria-labelledby="service-intro-title">
        <div className="site-container service-detail__intro-grid">
          <div className="service-detail__intro-copy">
            <p className="service-detail__eyebrow">Sobre nosso serviço</p>
            <h2 id="service-intro-title">{page.intro.title}</h2>
            {page.intro.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {page.intro.noteTitle ? <h3>{page.intro.noteTitle}</h3> : null}
            {page.intro.note ? <p>{page.intro.note}</p> : null}
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

      {page.benefits || page.whyChoose ? (
        <section className="service-detail__benefits" aria-label="Benefícios e diferenciais">
          <div className="site-container service-detail__benefits-grid">
            {page.benefits ? (
              <div className="service-detail__benefit-panel">
                <p className="service-detail__eyebrow">{page.benefits.eyebrow}</p>
                <h2>{page.benefits.title}</h2>
                <ul>{page.benefits.items.map((item) => <li key={item}>{item}</li>)}</ul>
                {page.beforeAfter ? <LegacyCarousel images={page.beforeAfter} label="Casos antes e depois" /> : null}
              </div>
            ) : null}
            {page.whyChoose ? (
              <div className="service-detail__why-panel">
                <p className="service-detail__eyebrow">{page.whyChoose.eyebrow}</p>
                <h2>{page.whyChoose.title}</h2>
                <ul>{page.whyChoose.items.map((item) => <li key={item}>{item}</li>)}</ul>
                {page.whyChooseGallery ? <LegacyCarousel images={page.whyChooseGallery} label="Ambiente e atendimento de terapia capilar" /> : null}
              </div>
            ) : null}
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
