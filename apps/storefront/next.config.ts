import type { NextConfig } from 'next';

const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3000';
const api = new URL(apiUrl);

function getDeployVersion(): string {
  if (process.env.NEXT_PUBLIC_DEPLOY_VERSION) {
    return process.env.NEXT_PUBLIC_DEPLOY_VERSION;
  }
  try {
    const now = new Date();
    const d = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(now);
    const [day, month, year] = d.split('/');

    const timeParts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).formatToParts(now);

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

const deployVersion = getDeployVersion();

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_DEPLOY_VERSION: deployVersion,
  },
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  async rewrites() {
    return [{ source: '/api/v1/:path*', destination: `${api.origin}/api/v1/:path*` }];
  },
  devIndicators: {
    position: 'bottom-right',
  },
  // Componentes compartilhados são publicados como TS e transpilados aqui.
  transpilePackages: ['@commerce/ui'],
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    minimumCacheTTL: 3600,
    // As imagens de produto são servidas pela API (storage/uploads): nunca há
    // hotlink externo (docs/memory-ai.md §3).
    remotePatterns: [
      {
        protocol: api.protocol === 'https:' ? 'https' : 'http',
        hostname: api.hostname,
        port: api.port || undefined,
        pathname: '/storage/**',
      },
    ],
  },
};

export default nextConfig;
