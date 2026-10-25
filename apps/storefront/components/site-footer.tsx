import Image from 'next/image';
import Link from 'next/link';
import { Facebook, Instagram, Music2 } from 'lucide-react';
import type { SiteConfig } from '@/lib/types';

type SiteFooterProps = {
  site: SiteConfig['site'] | null;
  categories: Array<{ id: string; name: string; slug: string }>;
};

/** Rodapé oficial (Seção 20 de site-final): logo centralizada, redes sociais e barra inferior azul. */
export function SiteFooter({ site }: SiteFooterProps) {
  return (
    <footer className="bg-[#141519] text-white">
      <div className="border-t border-white/10 py-10 sm:py-12">
        <div className="cn-container flex flex-col items-center justify-center text-center">
          <Link className="inline-block" href="/">
            <Image
              alt={site?.siteName ?? 'Comercial do Norte'}
              className="h-12 w-auto object-contain sm:h-14"
              height={60}
              src="/assets/Logos/logo-comercial-do-norte-branca.png"
              unoptimized
              width={210}
            />
          </Link>

          <div className="mt-5 flex items-center justify-center gap-3">
            <a
              aria-label="Instagram Comercial do Norte"
              className="flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:border-white/40 hover:bg-white/15 hover:text-white"
              href="https://www.instagram.com/comercialdonorte"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Instagram className="size-4" />
            </a>
            <a
              aria-label="TikTok Comercial do Norte"
              className="flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:border-white/40 hover:bg-white/15 hover:text-white"
              href="https://www.tiktok.com/@comercialdonorte"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Music2 className="size-4" />
            </a>
            <a
              aria-label="Facebook Comercial do Norte"
              className="flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:border-white/40 hover:bg-white/15 hover:text-white"
              href="https://www.facebook.com/comercialdonorte"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Facebook className="size-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Barra Azul Inferior */}
      <div className="bg-[#1D3B78] py-3.5 text-[11px] text-white/90 sm:text-xs">
        <div className="cn-container flex flex-col items-center justify-between gap-3 md:flex-row">
          <p>
            Copyright © {new Date().getFullYear()} {site?.siteName ?? 'Comercial do Norte'} – Todos os direitos reservados
          </p>

          <Link className="underline-offset-4 hover:underline" href="/loja">
            Termos &amp; Privacidade
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-white/75">Desenvolvido por:</span>
            <Image
              alt="idedigital"
              className="h-4 w-auto object-contain"
              height={20}
              src="/assets/Logos/logo-idedigital.png"
              unoptimized
              width={80}
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
