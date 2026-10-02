import { createContext, useContext } from 'react';

export type PublicSiteConfig = {
  site: {
    siteName: string;
    logoPath: string | null;
    faviconPath: string | null;
    address: string | null;
    phone: string | null;
    whatsapp: string | null;
    instagramUrl: string | null;
    title: string | null;
    description: string | null;
  };
  banners: Array<{
    id: string;
    desktopPath: string;
    mobilePath: string | null;
    eyebrow: string | null;
    title: string | null;
    description: string | null;
    ctaLabel: string | null;
    ctaHref: string | null;
    sortOrder: number;
  }>;
};

export const SiteConfigContext = createContext<PublicSiteConfig | null>(null);

export function isSafeCtaHref(value: string | null | undefined): value is string {
  return Boolean(value && /^(?:\/(?!\/)[^\s]*|https:\/\/[^\s]+|mailto:[^\s]+|tel:[^\s]+)$/i.test(value));
}

export function useSiteConfig(): PublicSiteConfig | null {
  return useContext(SiteConfigContext);
}

export async function loadSiteConfig(
  fetcher: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> = fetch,
): Promise<PublicSiteConfig | null> {
  try {
    const response = await fetcher('/api/v1/site/config', { credentials: 'same-origin' });
    if (!response.ok) return null;
    return await response.json() as PublicSiteConfig;
  } catch {
    return null;
  }
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

function phoneHref(value: string | null, fallback: string): string {
  if (!value) return fallback;
  const digits = digitsOnly(value);
  if (digits.length === 10 || digits.length === 11) return `tel:+55${digits}`;
  if (digits.length >= 12 && digits.length <= 15) return `tel:+${digits}`;
  return fallback;
}

function whatsappHref(value: string | null, fallback: string): string {
  if (!value) return fallback;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  const digits = digitsOnly(value);
  return digits ? `https://wa.me/${digits}` : fallback;
}

export function resolveSiteContent<T extends {
  name: string;
  address: string;
  phone: string;
  phoneHref: string;
  instagram: string;
  whatsapp: string;
  logoPath: string;
}>(fallback: T, remote: PublicSiteConfig | null): T {
  if (!remote) return fallback;
  const remoteSite = remote.site;
  return {
    ...fallback,
    name: remoteSite.siteName || fallback.name,
    address: remoteSite.address || fallback.address,
    phone: remoteSite.phone || fallback.phone,
    phoneHref: phoneHref(remoteSite.phone, fallback.phoneHref),
    instagram: remoteSite.instagramUrl || fallback.instagram,
    whatsapp: whatsappHref(remoteSite.whatsapp, fallback.whatsapp),
    logoPath: remoteSite.logoPath || fallback.logoPath,
  };
}
