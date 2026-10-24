import type { NextConfig } from 'next';

const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3000';
const api = new URL(apiUrl);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Componentes compartilhados são publicados como TS e transpilados aqui.
  transpilePackages: ['@commerce/ui'],
  images: {
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
