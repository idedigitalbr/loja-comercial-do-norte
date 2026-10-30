import { describe, expect, it } from 'vitest';
import { nortFrameAt, nortShowsInvitation } from './nort-timeline';

describe('Nort 60-second loop', () => {
  it('plays idle, thumbs-up, wave, thinking and the return to idle', () => {
    // 0s a 4s: Idle inicial
    expect(nortFrameAt(0)).toBe(0);
    expect(nortFrameAt(2)).toBeGreaterThanOrEqual(0);
    expect(nortFrameAt(2)).toBeLessThan(8);

    // 4s a 6.5s: Tirando a mão do bolso
    expect(nortFrameAt(5)).toBeGreaterThanOrEqual(8);
    expect(nortFrameAt(5)).toBeLessThan(16);

    // 6.5s a 14s: Joinha / like
    expect(nortFrameAt(10)).toBeGreaterThanOrEqual(16);
    expect(nortFrameAt(10)).toBeLessThan(24);

    // 17s a 24s: Aceno amigável de mão
    expect(nortFrameAt(20)).toBeGreaterThanOrEqual(24);
    expect(nortFrameAt(20)).toBeLessThan(32);

    // 27s a 37s: Pose pensativa
    expect(nortFrameAt(30)).toBeGreaterThanOrEqual(40);
    expect(nortFrameAt(30)).toBeLessThan(48);

    // 37s a 42s: Balão fecha, descendo o braço
    expect(nortFrameAt(39)).toBeGreaterThanOrEqual(48);
    expect(nortFrameAt(39)).toBeLessThan(56);

    // 42s a 48s: Guardando as mãos no bolso
    expect(nortFrameAt(45)).toBeGreaterThanOrEqual(56);
    expect(nortFrameAt(45)).toBeLessThan(64);

    // 60s: Reinicia o ciclo perfeitamente
    expect(nortFrameAt(60)).toBe(0);
  });

  it('shows the automatic balloon only during the listening pose (27s to 37s), on each loop', () => {
    expect(nortShowsInvitation(26.9)).toBe(false);
    expect(nortShowsInvitation(27.0)).toBe(true);
    expect(nortShowsInvitation(32.0)).toBe(true);
    expect(nortShowsInvitation(36.9)).toBe(true);
    expect(nortShowsInvitation(37.0)).toBe(false);
    // Próximo loop (+60s)
    expect(nortShowsInvitation(87.5)).toBe(true);
  });

  it('never selects outside the 64-frame atlas', () => {
    for (let t = 0; t < 120; t += 0.05) {
      const f = nortFrameAt(t);
      expect(f).toBeGreaterThanOrEqual(0);
      expect(f).toBeLessThan(64);
    }
  });
});
