export const isolated = process.env.E2E_MODE === 'isolated';
export function isLoopback(value) {
  const url = new URL(value);
  return ['http:', 'https:'].includes(url.protocol) && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
}
export const storefrontUrl = process.env.STOREFRONT_URL ?? (isolated ? 'http://127.0.0.1:3101' : 'https://loja-comercialdonorte.vercel.app');
export const adminUrl = process.env.ADMIN_URL ?? 'http://127.0.0.1:5179';
export const fixtureApiUrl = 'http://127.0.0.1:3189';
if (isolated && (!isLoopback(storefrontUrl) || !isLoopback(adminUrl))) throw new Error('Isolated E2E may only use loopback URLs. Production writes are forbidden.');
