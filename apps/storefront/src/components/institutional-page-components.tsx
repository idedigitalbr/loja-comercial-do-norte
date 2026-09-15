import { ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { institutionalContent } from '../content/institutional-content';

export function InstitutionalImage({ src, alt, className, loading, decoding }: { src: string; alt: string; className?: string; loading?: 'eager' | 'lazy'; decoding?: 'async' | 'auto' | 'sync' }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <div className={`${className ?? ''} institutional-image-fallback`} role="img" aria-label={alt}><span>Jonas & Elivaldo</span></div>;
  }

  return <img className={className} src={src} alt={alt} loading={loading} decoding={decoding} onError={() => setFailed(true)} />;
}

export function InstitutionalPageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="institutional-page-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="institutional-page-intro__description">{description}</p>
    </div>
  );
}

export function WhatsAppLink({ children, className = 'button button--primary' }: { children: ReactNode; className?: string }) {
  return <a className={className} href={institutionalContent.site.whatsapp} target="_blank" rel="noreferrer">{children}</a>;
}

export function InstitutionalCta({ eyebrow, title, children, href = institutionalContent.site.whatsapp }: { eyebrow: string; title: string; children: ReactNode; href?: string }) {
  const external = href.startsWith('http');
  const action = external
    ? <a className="button button--primary" href={href} target="_blank" rel="noreferrer">{children}</a>
    : <Link className="button button--primary" to={href}>{children}</Link>;

  return (
    <section className="institutional-cta">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {action}
    </section>
  );
}
