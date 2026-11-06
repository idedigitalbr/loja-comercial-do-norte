import type { Metadata } from 'next';
import { getSiteConfig } from '@/lib/api';
import { VideoPageClient } from './video-page-client';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://loja-comercialdonorte.vercel.app';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Vídeo Oficial | Comercial do Norte',
  description:
    'Para todos os Negócios, De todos os tamanhos. Assista ao vídeo de apresentação da Comercial do Norte — Embalagens, descartáveis, confeitaria e mercearia em Belém/PA.',
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: `${siteUrl}/video`,
  },
  openGraph: {
    title: 'Comercial do Norte | Assista nossa apresentação oficial',
    description:
      'Para todos os Negócios, De todos os tamanhos. Embalagens, descartáveis e mercearia em Belém/PA. Assista ao vídeo oficial!',
    url: `${siteUrl}/video`,
    siteName: 'Comercial do Norte',
    locale: 'pt_BR',
    type: 'video.other',
    images: [
      {
        url: `${siteUrl}/videos/nort-intro-poster.jpg`,
        width: 1200,
        height: 630,
        alt: 'Comercial do Norte - Assista nosso vídeo oficial',
      },
    ],
    videos: [
      {
        url: `${siteUrl}/videos/nort-intro.mp4`,
        width: 1920,
        height: 1080,
        type: 'video/mp4',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Comercial do Norte | Assista nossa apresentação oficial',
    description:
      'Para todos os Negócios, De todos os tamanhos. Embalagens, descartáveis e mercearia em Belém/PA. Assista agora!',
    images: [`${siteUrl}/videos/nort-intro-poster.jpg`],
  },
};

export default async function VideoPage() {
  const config = await getSiteConfig();
  const site = config?.site ?? null;

  return (
    <VideoPageClient
      whatsapp={site?.whatsapp ?? '5591983440880'}
      siteUrl={siteUrl}
    />
  );
}
