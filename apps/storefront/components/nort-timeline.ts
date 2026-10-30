export const NORT_LOOP_SECONDS = 60;

/**
 * Atuação contínua de 60 segundos do Mascote Nort:
 * 0s a 4s: Idle com mãos no bolso (respirando e piscando nos frames 0..7)
 * 4s a 6.5s: Tirando a mão do bolso (frames 8..15)
 * 6.5s a 14s: Joinha / Like com micro-movimento alegre (frames 16..23)
 * 14s a 17s: Transição do joinha para o aceno (frames 20..25)
 * 17s a 24s: Aceno de mão amigável para o visitante (frames 24..31 em loop)
 * 24s a 27s: Transição para pose pensativa / mão no queixo (frames 32..39)
 * 27s a 37s: Pose pensativa com o BALÃO ABERTO SOZINHO por 10s (frames 40..47)
 * 37s a 42s: Balão fecha sozinho, solta o queixo e desce o braço (frames 48..55)
 * 42s a 48s: Guardando as mãos de volta no bolso (frames 56..63)
 * 48s a 60s: Idle relaxado no bolso antes de reiniciar o próximo ciclo
 */
export function nortFrameAt(seconds: number): number {
  const t = ((seconds % NORT_LOOP_SECONDS) + NORT_LOOP_SECONDS) % NORT_LOOP_SECONDS;

  // 0s a 4s: Idle inicial com mãos no bolso
  if (t < 4.0) {
    return Math.floor(t * 2) % 8;
  }

  // 4s a 6.5s: Tirando a mão do bolso
  if (t < 6.5) {
    return 8 + Math.min(7, Math.floor(((t - 4.0) / 2.5) * 8));
  }

  // 6.5s a 14s: Joinha / Like
  if (t < 14.0) {
    if (t < 7.5) {
      return 16 + Math.min(7, Math.floor(((t - 6.5) / 1.0) * 8));
    }
    return 20 + (Math.floor((t - 7.5) * 2) % 4);
  }

  // 14s a 17s: Transição para o aceno
  if (t < 17.0) {
    return 20 + Math.min(4, Math.floor(((t - 14.0) / 3.0) * 5));
  }

  // 17s a 24s: Aceno amigável de mão
  if (t < 24.0) {
    return 24 + (Math.floor((t - 17.0) * 4) % 8);
  }

  // 24s a 27s: Transição para pose pensativa
  if (t < 27.0) {
    return 32 + Math.min(7, Math.floor(((t - 24.0) / 3.0) * 8));
  }

  // 27s a 37s: Pose pensativa (durante exibição do balão de ajuda)
  if (t < 37.0) {
    return 40 + (Math.floor((t - 27.0) * 1.5) % 8);
  }

  // 37s a 42s: Balão fecha, descendo o braço
  if (t < 42.0) {
    return 48 + Math.min(7, Math.floor(((t - 37.0) / 5.0) * 8));
  }

  // 42s a 48s: Guardando as mãos no bolso
  if (t < 48.0) {
    return 56 + Math.min(7, Math.floor(((t - 42.0) / 6.0) * 8));
  }

  // 48s a 60s: Idle com mãos no bolso até fechar 60s
  return Math.floor((t - 48.0) * 1.5) % 8;
}

export function nortShowsInvitation(seconds: number): boolean {
  const t = ((seconds % NORT_LOOP_SECONDS) + NORT_LOOP_SECONDS) % NORT_LOOP_SECONDS;
  return t >= 27.0 && t < 37.0;
}
