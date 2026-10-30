/**
 * Formata o timestamp de build/deploy no padrão solicitado:
 * vDD-MM-YYYY-H-MPM (exemplo: v30-10-2026-12-24pm)
 * no fuso horário canônico de Brasília (America/Sao_Paulo).
 */
export function formatDeployVersion(date: Date = new Date()): string {
  try {
    const d = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
    const [day, month, year] = d.split('/');

    const timeParts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).formatToParts(date);

    const hour = timeParts.find((p) => p.type === 'hour')?.value ?? '12';
    const minute = timeParts.find((p) => p.type === 'minute')?.value ?? '00';
    const dayPeriod = (
      timeParts.find((p) => p.type === 'dayPeriod')?.value ?? 'pm'
    ).toLowerCase();

    return `v${day}-${month}-${year}-${hour}-${minute}${dayPeriod}`;
  } catch {
    return 'v30-10-2026-12-00pm';
  }
}

/**
 * Versão do aplicativo/deploy atual:
 * Em builds de produção na Vercel ou local, o Next.js injeta
 * process.env.NEXT_PUBLIC_DEPLOY_VERSION configurado no next.config.ts.
 */
export const APP_VERSION =
  process.env.NEXT_PUBLIC_DEPLOY_VERSION || formatDeployVersion();
