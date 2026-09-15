import { Link } from 'react-router-dom';
import { Icon } from '@commerce/ui';
import { InstitutionalCta, InstitutionalPageIntro, WhatsAppLink } from '../components/institutional-page-components';
import { institutionalContent } from '../content/institutional-content';

export function ServicesPage() {
  return (
    <main className="institutional-page institutional-services">
      <div className="site-container">
        <InstitutionalPageIntro eyebrow="Jonas & Elivaldo · Serviços" title="Serviços para realçar sua beleza" description="Cuidado, técnica e um atendimento pensado para que você se sinta confiante em cada detalhe." />
      </div>

      <section className="institutional-section institutional-services__catalog" aria-labelledby="services-catalog-title">
        <div className="site-container">
          <div className="institutional-section-heading">
            <div>
              <p className="eyebrow">Algumas das nossas soluções</p>
              <h2 id="services-catalog-title">Escolha o seu próximo cuidado.</h2>
            </div>
            <Link className="text-link" to="/loja">Conheça nossa loja <Icon name="arrow-up-right" size={15} strokeWidth={2} /></Link>
          </div>
          <div className="institutional-services-list">
            {institutionalContent.services.map((service) => (
              <article className="institutional-service-row" key={service.name}>
                <span className="institutional-service-row__number">{service.number}</span>
                <div>
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                </div>
                <div className="institutional-service-row__actions">
                  <Link className="text-link" to={service.href}>Conhecer <Icon name="arrow-up-right" size={15} strokeWidth={2} /></Link>
                  <WhatsAppLink className="button button--secondary">Agendar</WhatsAppLink>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="institutional-section institutional-section--dark institutional-services__process" aria-labelledby="services-process-title">
        <div className="site-container">
          <div className="institutional-section-heading institutional-section-heading--light">
            <div>
              <p className="eyebrow">Nossa forma de cuidar</p>
              <h2 id="services-process-title">Cada atendimento começa com escuta.</h2>
            </div>
            <p>Combinamos avaliação, protocolo e finalização para entregar um resultado bonito, seguro e com a sua identidade.</p>
          </div>
          <ol className="institutional-process-list">
            <li><span>01</span><strong>Avaliação</strong><p>Entendemos suas necessidades e o que seus fios precisam.</p></li>
            <li><span>02</span><strong>Protocolo</strong><p>Escolhemos técnicas e produtos profissionais para o seu objetivo.</p></li>
            <li><span>03</span><strong>Finalização</strong><p>Você sai com orientação para manter o resultado em casa.</p></li>
          </ol>
        </div>
      </section>

      <InstitutionalCta eyebrow="Agende seu horário" title="Vamos encontrar o cuidado ideal para você.">Chamar no WhatsApp</InstitutionalCta>
    </main>
  );
}
