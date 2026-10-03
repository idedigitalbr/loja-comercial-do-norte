import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from '@commerce/ui';
import { InstitutionalImage } from '../components/institutional-page-components';
import { institutionalContent } from '../content/institutional-content';

type TeamMember = (typeof institutionalContent.about.leaders)[number];

function emphasizePhrases(text: string, phrases: string[]): ReactNode[] {
  const segments: ReactNode[] = [];
  let position = 0;

  while (position < text.length) {
    const nextPhrase = phrases
      .map((phrase) => ({ phrase, index: text.indexOf(phrase, position) }))
      .filter((match) => match.index >= 0)
      .sort((left, right) => left.index - right.index || right.phrase.length - left.phrase.length)[0];

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

function aboutBackgroundVideoUrl(value: string): string | null {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    if (!['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(hostname)) return null;

    const pathParts = url.pathname.split('/').filter(Boolean);
    const videoId = pathParts[0] === 'embed' || pathParts[0] === 'shorts'
      ? pathParts[1]
      : url.searchParams.get('v');

    if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) return null;

    const params = new URLSearchParams({
      autoplay: '1',
      controls: '0',
      loop: '1',
      mute: '1',
      modestbranding: '1',
      playsinline: '1',
      playlist: videoId,
      rel: '0',
    });
    return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
  } catch {
    return null;
  }
}

function TeamCard({ member, featured = false, onOpen }: { member: TeamMember; featured?: boolean; onOpen: (trigger: HTMLButtonElement) => void }) {
  return (
    <button type="button" className={`institutional-team-card${featured ? ' institutional-team-card--featured' : ''}`} onClick={(event) => onOpen(event.currentTarget)} aria-label={`Conhecer ${member.name}`}>
      <InstitutionalImage className="institutional-team-card__image" src={member.image} alt={member.name} />
      <div className="institutional-team-card__content">
        <h3>{member.name}</h3>
        <p>{member.role}</p>
      </div>
    </button>
  );
}

function TeamMemberModal({ member, onClose }: { member: TeamMember; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    panel.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab') {
        const focusable = panel.current?.querySelectorAll<HTMLElement>('button, a[href]');
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="team-modal" role="dialog" aria-modal="true" aria-label={member.profileName} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={panel} className="team-modal__panel">
        <button type="button" className="team-modal__close" onClick={onClose} aria-label="Fechar perfil"><Icon name="x" size={20} strokeWidth={2} /></button>
        <InstitutionalImage src={member.image} alt={member.name} />
        <div>
          <p className="institutional-about__section-eyebrow">Nossa equipe</p>
          <h2>{member.profileName}</h2>
          <p>{member.profileRole}</p>
          {member.detail ? <p style={{ whiteSpace: 'pre-line' }}>{member.detail}</p> : null}
        </div>
      </div>
    </div>
  );
}

export function AboutPage() {
  const { about, images } = institutionalContent;
  const backgroundVideo = aboutBackgroundVideoUrl(institutionalContent.hero.videoHref);
  const featuredTeam = about.leaders.slice(0, 2);
  const supportingTeam = about.leaders.slice(2);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const profileTrigger = useRef<HTMLButtonElement | null>(null);
  const openMember = (member: TeamMember, trigger: HTMLButtonElement) => {
    profileTrigger.current = trigger;
    setSelectedMember(member);
  };
  const closeMember = () => {
    setSelectedMember(null);
    window.setTimeout(() => profileTrigger.current?.focus(), 0);
  };

  return (
    <main className="institutional-page institutional-about">
      <section className="institutional-about__hero" aria-labelledby="about-hero-title">
        <div className="institutional-about__hero-poster" style={{ backgroundImage: `url("${images.aboutValuesBackdrop}")` }} aria-hidden="true" />
        {backgroundVideo ? <iframe
          className="institutional-about__hero-video"
          src={backgroundVideo}
          title="Vídeo de apresentação Jonas & Elivaldo Hair Designers"
          allow="autoplay; encrypted-media; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          loading="eager"
          tabIndex={-1}
          aria-hidden="true"
        /> : null}
        <div className="institutional-about__hero-overlay" aria-hidden="true" />
        <div className="site-container institutional-about__hero-content">
          <h1 id="about-hero-title" className="sr-only">Sobre nós</h1>
        </div>
      </section>

      <section className="institutional-section institutional-about__story" aria-labelledby="about-story-title">
        <div className="site-container institutional-about__story-grid">
          <div className="institutional-about__story-gallery">
            <InstitutionalImage
              className="institutional-about__story-gallery-main"
              src={images.aboutStoryMain}
              alt="Jonas & Elivaldo Hair Designers em sua história"
            />
            <div className="institutional-about__story-gallery-stack">
              <InstitutionalImage src={images.aboutStoryPortrait} alt="Retrato da equipe Jonas & Elivaldo" />
              <InstitutionalImage src={images.aboutStoryPortraitDark} alt="Retrato de Elivaldo Hair Designer" />
            </div>
          </div>

          <div className="institutional-about__story-copy">
            <p className="institutional-about__section-eyebrow">CONHEÇA A</p>
            <h2 id="about-story-title">Nossa História</h2>
            <div className="institutional-about__divider" aria-hidden="true" />
            {about.story.map((paragraph, index) => {
              const emphasisByParagraph = [
                ['Jonas & Elivaldo Hair Designers', 'Elivaldo'],
                ['Macapá', '19 anos'],
                ['2009', 'Belos Fios', 'Infraero 2'],
                ['2017', 'Elivaldo', 'Jonas', '2018', 'Jonas & Elivaldo Hair Designers'],
                ['2022', 'centro de Macapá'],
              ];
              return <p key={paragraph}>{emphasizePhrases(paragraph, emphasisByParagraph[index] ?? [])}</p>;
            })}
          </div>
        </div>
      </section>

      <section className="institutional-about__values" aria-label="Missão, visão e valores">
        <div className="institutional-about__values-grid">
          <InstitutionalImage className="institutional-about__values-photo" src={images.aboutValuesBackdrop} alt="" />
          <InstitutionalImage className="institutional-about__values-photo" src={images.aboutMissionBackdrop} alt="" />
          <InstitutionalImage className="institutional-about__values-photo" src={images.aboutVisionBackdrop} alt="" />
          <InstitutionalImage className="institutional-about__values-photo" src={images.aboutValuesBackdropCard} alt="" />
          <InstitutionalImage className="institutional-about__values-photo" src={images.aboutValuesBackdropEnd} alt="" />
        </div>
        <div className="institutional-about__values-content">
          <article className="institutional-about__value-card institutional-about__value-card--mission">
            <h2>Missão</h2>
            <p>{about.mission}</p>
          </article>
          <article className="institutional-about__value-card institutional-about__value-card--vision">
            <h2>Visão</h2>
            <p>{about.vision}</p>
          </article>
          <article className="institutional-about__value-card institutional-about__value-card--values">
            <h2>Valores</h2>
            <p>{about.values}</p>
          </article>
        </div>
      </section>

      <section className="institutional-section institutional-about__team" aria-labelledby="about-team-title">
        <div className="site-container">
          <div className="institutional-about__team-heading">
            <p className="institutional-about__section-eyebrow">CONHEÇA</p>
            <h2 id="about-team-title">Nossa Equipe</h2>
            <div className="institutional-about__divider institutional-about__divider--center" aria-hidden="true" />
          </div>

          <div className="institutional-team-grid institutional-team-grid--featured">
            {featuredTeam.map((member) => <TeamCard key={member.name} member={member} featured onOpen={(trigger) => openMember(member, trigger)} />)}
          </div>
          <div className="institutional-team-grid institutional-team-grid--supporting">
            {supportingTeam.map((member) => <TeamCard key={member.name} member={member} onOpen={(trigger) => openMember(member, trigger)} />)}
          </div>
        </div>
      </section>

      {selectedMember ? <TeamMemberModal member={selectedMember} onClose={closeMember} /> : null}
    </main>
  );
}
