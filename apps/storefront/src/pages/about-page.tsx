import { useEffect, useRef, useState } from 'react';
import { Icon } from '@commerce/ui';
import { InstitutionalImage } from '../components/institutional-page-components';
import { institutionalContent } from '../content/institutional-content';

type TeamMember = (typeof institutionalContent.about.leaders)[number];

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
    <div className="team-modal" role="dialog" aria-modal="true" aria-label={member.name} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={panel} className="team-modal__panel">
        <button type="button" className="team-modal__close" onClick={onClose} aria-label="Fechar perfil"><Icon name="x" size={20} strokeWidth={2} /></button>
        <InstitutionalImage src={member.image} alt={member.name} />
        <div>
          <p className="institutional-about__section-eyebrow">Nossa equipe</p>
          <h2>{member.name}</h2>
          <p>{member.role}</p>
          {member.detail ? <p>{member.detail}</p> : null}
        </div>
      </div>
    </div>
  );
}

export function AboutPage() {
  const { about, images } = institutionalContent;
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
            {about.story.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </div>
      </section>

      <section className="institutional-about__values" aria-label="Missão, visão e valores">
        <div className="institutional-about__values-grid">
          <InstitutionalImage className="institutional-about__values-photo" src={images.aboutValuesBackdrop} alt="Ambiente Jonas & Elivaldo Hair Designers" />

          <article className="institutional-about__value-card institutional-about__value-card--mission" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, .68), rgba(0, 0, 0, .68)), url("${images.aboutMissionBackdrop}")` }}>
            <Icon name="heart-handshake" className="institutional-about__value-icon" size={70} strokeWidth={1.35} />
            <h2>Missão</h2>
            <p>{about.mission}</p>
          </article>

          <article className="institutional-about__value-card institutional-about__value-card--vision" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, .68), rgba(0, 0, 0, .68)), url("${images.aboutVisionBackdrop}")` }}>
            <Icon name="eye" className="institutional-about__value-icon" size={70} strokeWidth={1.35} />
            <h2>Visão</h2>
            <p>{about.vision}</p>
          </article>

          <article className="institutional-about__value-card institutional-about__value-card--values" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, .68), rgba(0, 0, 0, .68)), url("${images.aboutValuesBackdropCard}")` }}>
            <Icon name="badge-check" className="institutional-about__value-icon" size={70} strokeWidth={1.35} />
            <h2>Valores</h2>
            <p>{about.values}</p>
          </article>

          <InstitutionalImage className="institutional-about__values-photo" src={images.aboutValuesBackdropEnd} alt="Espaço Jonas & Elivaldo Hair Designers" />
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
