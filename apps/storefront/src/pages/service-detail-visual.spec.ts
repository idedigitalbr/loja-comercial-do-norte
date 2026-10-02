import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const style = document.createElement('style');

beforeAll(() => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1370 });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 997 });
  const stylesheet = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8');
  style.textContent = stylesheet.replace(/^@import .*;$/gm, '');
  document.head.append(style);
});

afterAll(() => style.remove());

describe('service detail visual contracts', () => {
  it('keeps the hero eyebrow at the legacy line-height inside the institutional page', () => {
    const page = document.createElement('main');
    page.className = 'institutional-page service-detail';

    const hero = document.createElement('section');
    hero.className = 'service-detail__hero';
    const content = document.createElement('div');
    content.className = 'service-detail__hero-content';
    const eyebrow = document.createElement('p');
    eyebrow.className = 'service-detail__hero-eyebrow';
    eyebrow.textContent = 'Serviço';
    const title = document.createElement('h1');
    title.textContent = 'Terapia Capilar';
    const button = document.createElement('a');
    button.className = 'button button--primary';
    button.textContent = 'Saiba mais';
    content.append(eyebrow, title, button);
    hero.append(content);
    page.append(hero);
    document.body.append(page);

    const eyebrowStyle = getComputedStyle(eyebrow);
    expect(eyebrowStyle.lineHeight).toBe('14px');
    expect(eyebrowStyle.fontFamily).toContain('Playfair');
    expect(eyebrowStyle.fontFamily).not.toContain('Display');
    expect(getComputedStyle(title).fontFamily).toBe('sans-serif');
    expect(getComputedStyle(button).fontFamily).toBe('sans-serif');

    page.remove();
  });

  it.each([
    ['cabelos-e-penteados', 326, 435, 254, 452],
    ['maquiagem', 455, 569, 254, 317],
    ['manicure-pedicure', 455, 607, 254, 451],
    ['terapia-capilar', 455, 680, 191, 260],
  ] as const)('matches the original desktop intro layout for %s', (slug, mainWidth, mainHeight, secondaryWidth, secondaryHeight) => {
    const page = document.createElement('main');
    page.className = `institutional-page service-detail service-detail--${slug}`;
    page.innerHTML = `
      <section class="service-detail__intro">
        <div class="site-container service-detail__intro-grid">
          <div class="service-detail__intro-copy">
            <p class="service-detail__eyebrow">SOBRE NOSSO SERVIÇO</p>
            <h2>Serviço profissional para você</h2>
            <p>Texto de apresentação do serviço.</p>
            <a class="button button--primary" href="#">Chame no WhatsApp</a>
          </div>
          <div class="service-detail__intro-collage">
            <img class="service-detail__intro-image" src="/main.jpg" alt="Imagem principal" />
            <img class="service-detail__intro-image" src="/secondary.jpg" alt="Imagem secundária" />
          </div>
        </div>
      </section>
    `;
    document.body.append(page);

    const heading = page.querySelector('.service-detail__intro h2') as HTMLElement;
    const copy = page.querySelector('.service-detail__intro-copy') as HTMLElement;
    const eyebrow = page.querySelector('.service-detail__eyebrow') as HTMLElement;
    const paragraph = copy.querySelector('p:not(.service-detail__eyebrow)') as HTMLElement;
    const button = copy.querySelector('.button') as HTMLElement;
    const images = [...page.querySelectorAll<HTMLImageElement>('.service-detail__intro-image')];

    const headingStyle = getComputedStyle(heading);
    expect(headingStyle.fontSize).toBe('31px');
    expect(headingStyle.fontWeight).toBe('800');
    expect(headingStyle.lineHeight).toBe('37px');
    expect(headingStyle.fontFamily).toBe('sans-serif');
    expect(getComputedStyle(copy).padding).toBe('55px');
    const eyebrowStyle = getComputedStyle(eyebrow);
    expect(eyebrowStyle.fontSize).toBe('12px');
    expect(eyebrowStyle.fontWeight).toBe('600');
    expect(eyebrowStyle.lineHeight).toBe('12px');
    expect(eyebrowStyle.letterSpacing).toBe('1.1px');
    expect(eyebrowStyle.fontFamily).toBe('sans-serif');
    const paragraphStyle = getComputedStyle(paragraph);
    expect(paragraphStyle.fontSize).toBe('16px');
    expect(paragraphStyle.lineHeight).toBe('24px');
    expect(paragraphStyle.fontFamily).toBe('sans-serif');
    const buttonStyle = getComputedStyle(button);
    expect(buttonStyle.fontSize).toBe('13px');
    expect(buttonStyle.lineHeight).toBe('13px');
    expect(buttonStyle.letterSpacing).toBe('1.4px');
    expect(buttonStyle.fontFamily).toBe('sans-serif');
    const finalParagraph = copy.querySelector('p:last-of-type') as HTMLElement;
    const finalParagraphStyle = getComputedStyle(finalParagraph);
    const totalCtaGap = Number.parseFloat(finalParagraphStyle.marginBottom) + Number.parseFloat(buttonStyle.marginTop);
    expect(totalCtaGap).toBe(36);
    expect(images.map((image) => [getComputedStyle(image).width, getComputedStyle(image).height])).toEqual([
      [`${mainWidth}px`, `${mainHeight}px`],
      [`${secondaryWidth}px`, `${secondaryHeight}px`],
    ]);

    page.remove();
  });
});
