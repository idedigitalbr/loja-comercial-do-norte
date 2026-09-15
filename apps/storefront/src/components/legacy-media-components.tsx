import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { Icon } from '@commerce/ui';
import { InstitutionalImage } from './institutional-page-components';

export type LegacyMedia = { src: string; alt: string };

function useDialogKeys(open: boolean, panel: RefObject<HTMLElement | null>, onClose: () => void, onPrevious?: () => void, onNext?: () => void) {
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') onPrevious?.();
      if (event.key === 'ArrowRight') onNext?.();
      if (event.key === 'Tab') {
        const focusable = panel.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]');
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose, onNext, onPrevious, open, panel]);
}

export function MediaLightbox({ images, activeIndex, onChange, onClose }: {
  images: LegacyMedia[];
  activeIndex: number | null;
  onChange: (index: number) => void;
  onClose: () => void;
}) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const open = activeIndex !== null;
  const previous = useCallback(() => {
    if (activeIndex !== null) onChange((activeIndex - 1 + images.length) % images.length);
  }, [activeIndex, images.length, onChange]);
  const next = useCallback(() => {
    if (activeIndex !== null) onChange((activeIndex + 1) % images.length);
  }, [activeIndex, images.length, onChange]);
  useDialogKeys(open, panel, onClose, previous, next);
  useEffect(() => { if (open) closeButton.current?.focus(); }, [open]);
  if (activeIndex === null) return null;

  return (
    <div ref={panel} className="media-lightbox" role="dialog" aria-modal="true" aria-label="Visualização da galeria" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <button ref={closeButton} className="media-lightbox__close" type="button" onClick={onClose} aria-label="Fechar galeria"><Icon name="x" size={24} strokeWidth={1.8} /></button>
      <button className="media-lightbox__control media-lightbox__control--previous" type="button" onClick={previous} aria-label="Foto anterior"><Icon name="chevron-left" size={24} strokeWidth={1.8} /></button>
      <figure>
        <InstitutionalImage src={images[activeIndex].src} alt={images[activeIndex].alt} />
        <figcaption>{activeIndex + 1} de {images.length}</figcaption>
      </figure>
      <button className="media-lightbox__control media-lightbox__control--next" type="button" onClick={next} aria-label="Próxima foto"><Icon name="chevron-right" size={24} strokeWidth={1.8} /></button>
    </div>
  );
}

export function ProgressiveGallery({ title, eyebrow, description, images, initialCount = images.length }: {
  title: string;
  eyebrow: string;
  description: string;
  images: LegacyMedia[];
  initialCount?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const lightboxTrigger = useRef<HTMLButtonElement | null>(null);
  const visible = expanded ? images : images.slice(0, initialCount);
  const remaining = images.length - initialCount;
  const closeLightbox = useCallback(() => {
    setActiveIndex(null);
    window.setTimeout(() => lightboxTrigger.current?.focus(), 0);
  }, []);

  return (
    <section className="service-detail__results" role="region" aria-label={`Galeria de ${title}`}>
      <div className="site-container">
        <div className="service-detail__section-heading service-detail__section-heading--centered">
          <p className="service-detail__eyebrow">{eyebrow}</p>
          <h2>{title === 'Maquiagem' ? 'Resultados que Transformam' : 'Resultados Que Transformam'}</h2>
          <p>{description}</p>
          <span className="service-detail__gallery-count">{images.length} fotos</span>
        </div>
        <div className="service-detail__gallery-grid">
          {visible.map((image, index) => (
            <button type="button" key={`${image.src}-${index}`} onClick={(event) => { lightboxTrigger.current = event.currentTarget; setActiveIndex(index); }} aria-label={`Abrir foto ${index + 1} de ${images.length}`}>
              <InstitutionalImage src={image.src} alt={image.alt} loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
        {!expanded && remaining > 0 ? (
          <button className="button button--primary service-detail__gallery-more" type="button" onClick={() => setExpanded(true)}>
            Ver mais ({remaining} restantes)
          </button>
        ) : null}
      </div>
      <MediaLightbox images={images} activeIndex={activeIndex} onChange={setActiveIndex} onClose={closeLightbox} />
    </section>
  );
}

export function LegacyCarousel({ images, label, autoPlay, visibleItems = 1 }: { images: LegacyMedia[]; label: string; autoPlay?: number; visibleItems?: number }) {
  const [index, setIndex] = useState(0);
  const [temporarilyPaused, setTemporarilyPaused] = useState(false);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const pointerStart = useRef<number | null>(null);
  const previous = useCallback(() => setIndex((current) => (current - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIndex((current) => (current + 1) % images.length), [images.length]);
  const interact = (direction: 'previous' | 'next') => {
    setInteractionPaused(true);
    if (direction === 'previous') previous(); else next();
  };

  useEffect(() => {
    if (!autoPlay || temporarilyPaused || interactionPaused || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(next, autoPlay);
    return () => window.clearInterval(timer);
  }, [autoPlay, interactionPaused, next, temporarilyPaused]);

  const itemCount = Math.max(1, Math.min(Math.floor(visibleItems), images.length));
  const visibleImages = Array.from({ length: itemCount }, (_, offset) => images[(index + offset) % images.length]);

  return (
    <div
      className={`legacy-carousel${itemCount > 1 ? ' legacy-carousel--double' : ''}`}
      role="region"
      aria-label={label}
      tabIndex={0}
      onMouseEnter={() => setTemporarilyPaused(true)}
      onMouseLeave={() => setTemporarilyPaused(false)}
      onFocus={() => setTemporarilyPaused(true)}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setTemporarilyPaused(false); }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') { event.preventDefault(); interact('previous'); }
        if (event.key === 'ArrowRight') { event.preventDefault(); interact('next'); }
      }}
      onPointerDown={(event) => { pointerStart.current = event.clientX; }}
      onPointerUp={(event) => {
        if (pointerStart.current === null) return;
        const distance = event.clientX - pointerStart.current;
        pointerStart.current = null;
        if (Math.abs(distance) < 40) return;
        interact(distance > 0 ? 'previous' : 'next');
      }}
    >
      {visibleImages.map((image, offset) => <InstitutionalImage key={`${image.src}-${offset}`} src={image.src} alt={image.alt} />)}
      <button type="button" onClick={() => interact('previous')} aria-label="Item anterior"><Icon name="chevron-left" size={24} strokeWidth={1.8} /></button>
      <button type="button" onClick={() => interact('next')} aria-label="Próximo item"><Icon name="chevron-right" size={24} strokeWidth={1.8} /></button>
      <span>{index + 1} de {images.length}</span>
    </div>
  );
}
