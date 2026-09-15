import { Icon, type IconName } from '@commerce/ui';
import { InstitutionalImage, WhatsAppLink } from '../components/institutional-page-components';
import { LegacyCarousel } from '../components/legacy-media-components';
import { institutionalContent } from '../content/institutional-content';

const certificationIconMap: Record<string, IconName> = {
  globe: 'globe-2',
  circles: 'circle-plus',
  spinner: 'sparkles',
  shield: 'shield',
  'shield-check': 'shield-check',
  'trend-up': 'trending-up',
  microscope: 'microscope',
  chart: 'bar-chart-3',
  star: 'star',
  clipboard: 'clipboard-check',
  sliders: 'sliders-horizontal',
  seal: 'badge-check',
};

function CertificationIcon({ icon, className = '' }: { icon: string; className?: string }) {
  return (
    <span className={`certification-icon ${className}`.trim()} aria-hidden="true">
      <Icon name={certificationIconMap[icon] ?? 'sparkles'} size={50} strokeWidth={1.35} fill={icon === 'star' ? 'currentColor' : undefined} />
    </span>
  );
}

export function CertificationPage() {
  const { certification } = institutionalContent;
  const heroImages = [
    { src: certification.heroPortrait, alt: 'Elivaldo Lima com certificados internacionais' },
    { src: certification.heroCertificate, alt: 'Certificado oficial de homologação internacional' },
  ];

  return (
    <main className="institutional-page institutional-certification">
      <section className="certification-hero certification-hero--legacy" aria-labelledby="certification-title">
        <div className="certification-hero__medal" role="img" aria-label="Selo de certificação internacional" style={{ backgroundImage: `url("${certification.medalImage}")` }} />
        <div className="site-container certification-hero__grid">
          <div className="certification-hero__copy certification-hero__copy--legacy">
            <p className="eyebrow">{certification.eyebrow}</p>
            <h1 id="certification-title" className="sr-only">Padrão internacional</h1>
            <span className="certification-hero__divider" aria-hidden="true" />
            <p className="certification-hero__lead">
              <strong>O Salão Jonas &amp; Elivaldo Hair Designers transforma <span>conhecimento internacional com certificação</span> em experiências únicas para cada cliente.</strong>
            </p>
            <p><strong>Elivaldo Lima Barreto</strong>, diretor e fundador, possui <strong>certificação internacional em beleza</strong>, comprovando sua expertise, atualização constante e domínio das técnicas mais modernas do mercado.</p>
            <p>Isso significa que você está nas mãos de quem segue <strong>os mais altos padrões globais de qualidade, cuidado e resultado</strong>.</p>
            <div className="certification-hero__validation">
              <strong>Valide a Autenticidade da Certificação Oficial no portal CNBS</strong>
              <a className="button button--primary" href={certification.validationUrl} target="_blank" rel="noreferrer">
                <Icon name="calendar-plus" className="certification-hero__calendar-icon" size={15} strokeWidth={2} />
                Verificar certificação
              </a>
            </div>
          </div>
          <div className="certification-hero__media certification-hero__media--legacy">
            <InstitutionalImage className="certification-hero__portrait" src={heroImages[0].src} alt={heroImages[0].alt} />
            <InstitutionalImage className="certification-hero__certificate" src={heroImages[1].src} alt={heroImages[1].alt} />
          </div>
        </div>
      </section>

      <section className="certification-meaning certification-meaning--legacy institutional-section" aria-labelledby="certification-meaning-title">
        <div className="site-container">
          <div className="certification-section-heading">
            <p className="eyebrow">SAIBA</p>
            <span className="certification-section-divider" aria-hidden="true" />
            <h2 id="certification-meaning-title"><strong>O que significa</strong> essa <span>certificação</span></h2>
          </div>
          <div className="certification-card-grid certification-meaning__grid certification-meaning__grid--legacy">
            {certification.benefits.map((benefit) => (
              <article className="certification-meaning__card" key={benefit.title}>
                <CertificationIcon icon={benefit.icon} />
                <h3 className={['Técnicas Avançadas', 'Protocolos Atualizados'].includes(benefit.title) ? 'certification-meaning__card-title--forced-break' : undefined}>
                  {benefit.title}
                </h3>
                <p>{benefit.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="certification-exclusive certification-exclusive--legacy institutional-section" aria-labelledby="certification-exclusive-title">
        <div className="site-container">
          <div className="certification-section-heading">
            <p className="eyebrow">BENEFÍCIOS EXCLUSIVOS</p>
            <span className="certification-section-divider" aria-hidden="true" />
            <h2 id="certification-exclusive-title"><strong>O que você ganha</strong> com nossa <span>certificação</span></h2>
          </div>
          <div className="certification-exclusive__grid certification-exclusive__grid--legacy">
            {certification.exclusiveBenefits.map((benefit) => (
              <article className="certification-exclusive__card" key={benefit.title}>
                <div className="certification-exclusive__visual" style={{ backgroundImage: `url("${benefit.image}")` }}>
                  <CertificationIcon icon={benefit.icon} />
                  <h3>{benefit.title}</h3>
                </div>
                <div className="certification-exclusive__description">
                  <p>{benefit.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="certification-why certification-why--legacy institutional-section" aria-labelledby="certification-why-title">
        <div className="site-container certification-why__inner">
          <div className="certification-why__copy">
            <div className="certification-section-heading">
              <p className="eyebrow">SAIBA</p>
              <span className="certification-section-divider" aria-hidden="true" />
            <h2 id="certification-why-title" aria-label="Por que você deve Nos Escolher">Por que você deve<br /><strong>Nos</strong> <span><strong>Escolher</strong></span></h2>
              <p>{certification.whySummary}</p>
            </div>
            <div className="certification-why__commitments certification-why__commitments--legacy">
              {certification.commitments.map((commitment) => (
                <article key={commitment.title}>
                  <Icon name="circle" className="certification-why__commitment-dot" size={8} strokeWidth={0} fill="currentColor" />
                  <h3>{commitment.title}</h3>
                </article>
              ))}
            </div>
          </div>
          <div className="certification-why__media">
            <LegacyCarousel images={[...certification.carouselImages]} label="Certificação e especialista" autoPlay={5000} visibleItems={2} />
          </div>
        </div>
      </section>

      <section className="service-detail__closing service-detail__closing--image certification-closing" style={{ backgroundImage: `url("${certification.closingImage}")` }} aria-labelledby="certification-closing-title">
        <div className="service-detail__closing-overlay" aria-hidden="true" />
        <div className="site-container service-detail__closing-content">
          <p className="service-detail__eyebrow">Entre em contato</p>
          <h2 id="certification-closing-title">Pronta para transformar seu visual com padrão internacional?</h2>
          <p className="service-detail__closing-description">{certification.closingDescription}</p>
          <WhatsAppLink>Chame no WhatsApp</WhatsAppLink>
          <div className="service-detail__reassurance-grid">
            {certification.reassurance.map(({ title, description }, index) => <article key={title}><Icon name={(['sliders-horizontal', 'badge-check', 'heart-handshake'] as const)[index] ?? 'sparkles'} size={22} strokeWidth={1.8} /><h3>{title}</h3>{description ? <p>{description}</p> : null}</article>)}
          </div>
        </div>
      </section>
    </main>
  );
}
