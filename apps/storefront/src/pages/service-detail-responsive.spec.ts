import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const stylesheet = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8');

function getAtRuleBlock(query: string): string {
  const marker = `@media (${query})`;
  const blocks: string[] = [];
  let markerIndex = 0;

  while ((markerIndex = stylesheet.indexOf(marker, markerIndex)) >= 0) {
    const openingIndex = stylesheet.indexOf('{', markerIndex);
    let depth = 0;
    for (let index = openingIndex; index < stylesheet.length; index += 1) {
      if (stylesheet[index] === '{') depth += 1;
      if (stylesheet[index] === '}') depth -= 1;
      if (depth === 0) {
        blocks.push(stylesheet.slice(openingIndex + 1, index));
        markerIndex = index + 1;
        break;
      }
    }
  }

  return blocks.join('\n');
}

function getRuleDeclarations(block: string, selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matches = [...block.matchAll(new RegExp(`(?:^|[\\n,])\\s*${escapedSelector}\\s*\\{([^}]*)`, 'g'))];
  return matches.at(-1)?.[1] ?? '';
}

describe('service detail mobile layout contracts', () => {
  it('matches the original compact mobile header controls', () => {
    const phoneStyles = getAtRuleBlock('max-width: 560px');

    expect(getRuleDeclarations(phoneStyles, '.utility-bar__inner')).toMatch(/flex-direction:\s*row/);
    expect(getRuleDeclarations(phoneStyles, '.utility-bar__address')).toMatch(/display:\s*none/);
    expect(getRuleDeclarations(phoneStyles, '.navigation-bar__inner')).toMatch(/min-height:\s*83\.4px/);
    expect(getRuleDeclarations(phoneStyles, '.header-actions')).toMatch(/display:\s*flex/);
    expect(getRuleDeclarations(phoneStyles, '.mobile-navigation > summary')).toMatch(/font-size:\s*0/);
  });

  it('keeps mobile service heroes full-height and places the intro collage before its text', () => {
    const phoneStyles = getAtRuleBlock('max-width: 560px');

    expect(getRuleDeclarations(phoneStyles, '.service-detail__hero')).toMatch(/min-height:\s*100vh/);
    expect(getRuleDeclarations(phoneStyles, '.service-detail__hero h1')).toMatch(/font-size:\s*55px/);
    expect(getRuleDeclarations(phoneStyles, '.service-detail__intro-grid')).toMatch(/width:\s*100%/);
    expect(getRuleDeclarations(phoneStyles, '.service-detail__intro-collage')).toMatch(/order:\s*0/);
    expect(getRuleDeclarations(phoneStyles, '.service-detail__intro-copy')).toMatch(/order:\s*1/);
    expect(getRuleDeclarations(phoneStyles, '.service-detail__intro-copy')).toMatch(/padding:\s*32px/);
  });

  it.each([
    ['cabelos-e-penteados', '648px', '-230px', '86%', '240px', '254px'],
    ['maquiagem', '538px', '-226px', '97%', '264px', '254px'],
    ['manicure-pedicure', '701px', '-155px', '97%', '287px', '254px'],
    ['terapia-capilar', '637px', '-160px', '97%', '352px', '243px'],
  ])('matches the %s mobile collage crops measured from the original', (slug, height, mainTop, mainWidth, secondaryTop, secondaryWidth) => {
    const phoneStyles = getAtRuleBlock('max-width: 560px');
    const pageSelector = `.service-detail--${slug}`;
    const collageStyles = getRuleDeclarations(phoneStyles, `${pageSelector} .service-detail__intro-collage`);
    const mainImageStyles = getRuleDeclarations(phoneStyles, `${pageSelector} .service-detail__intro-image:first-child`);
    const secondaryImageStyles = getRuleDeclarations(phoneStyles, `${pageSelector} .service-detail__intro-image:last-child`);

    expect(collageStyles).toMatch(new RegExp(`height:\\s*${height.replace('.', '\\.')}`));
    expect(mainImageStyles).toMatch(/position:\s*absolute/);
    expect(mainImageStyles).toContain(`top: ${mainTop}`);
    expect(mainImageStyles).toContain(`width: ${mainWidth}`);
    expect(secondaryImageStyles).toMatch(/position:\s*absolute/);
    expect(secondaryImageStyles).toContain(`top: ${secondaryTop}`);
    expect(secondaryImageStyles).toContain(`width: ${secondaryWidth}`);
  });
});
