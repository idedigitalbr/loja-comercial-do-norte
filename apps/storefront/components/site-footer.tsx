import Link from 'next/link';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import type { SiteConfig } from '@/lib/types';

type SiteFooterProps = {
  site: SiteConfig['site'] | null;
  categories: Array<{ id: string; name: string; slug: string }>;
};

/** Rodapé S10: institucional, atendimento, contatos e aviso de fase 1. */
export function SiteFooter({ site, categories }: SiteFooterProps) {
  const whatsapp = site?.whatsapp?.replace(/\D+/g, '');
  return (
    <footer className="mt-16 bg-deep text-white">
      <div className="cn-container grid gap-8 py-12 md:grid-cols-4">
        <div>
          <p className="text-lg font-extrabold">{site?.siteName ?? 'Comercial do Norte'}</p>
          <p className="mt-2 text-sm text-white/70">
            Plásticos, descartáveis, embalagens, variedades e mercearia para atacado e varejo.
          </p>
          <p className="mt-4 inline-flex rounded-pill bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
            Fase 1 · catálogo e cotação
          </p>
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-white/60">Categorias</p>
          <ul className="mt-3 grid gap-2 text-sm">
            {categories.slice(0, 6).map((category) => (
              <li key={category.id}>
                <Link className="text-white/80 hover:text-white" href={`/categoria/${category.slug}`}>{category.name}</Link>
              </li>
            ))}
            <li><Link className="text-white/80 hover:text-white" href="/loja">Ver todo o catálogo</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-white/60">Atendimento</p>
          <ul className="mt-3 grid gap-3 text-sm text-white/80">
            <li className="flex items-start gap-2">
              <MessageCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
              <Link className="hover:text-white" href="/cotacao">Enviar lista e receber cotação</Link>
            </li>
            {site?.phone ? (
              <li className="flex items-start gap-2">
                <Phone aria-hidden className="mt-0.5 size-4 shrink-0" />
                <a className="hover:text-white" href={`tel:${site.phone.replace(/\D+/g, '')}`}>{site.phone}</a>
              </li>
            ) : null}
            {whatsapp ? (
              <li className="flex items-start gap-2">
                <MessageCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
                <a className="hover:text-white" href={`https://wa.me/${whatsapp}`} rel="noreferrer" target="_blank">WhatsApp comercial</a>
              </li>
            ) : null}
          </ul>
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-white/60">Loja física</p>
          <ul className="mt-3 grid gap-3 text-sm text-white/80">
            {site?.address ? (
              <li className="flex items-start gap-2">
                <MapPin aria-hidden className="mt-0.5 size-4 shrink-0" />
                <span>{site.address}</span>
              </li>
            ) : null}
            <li className="flex items-start gap-2">
              <Mail aria-hidden className="mt-0.5 size-4 shrink-0" />
              <span>Atendimento comercial pelo formulário de cotação</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="cn-container flex flex-col gap-2 py-4 text-xs text-white/60 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {site?.siteName ?? 'Comercial do Norte'}. Todos os direitos reservados.</p>
          <p>Sem cobrança online nesta fase. A negociação é feita pela equipe comercial.</p>
        </div>
      </div>
    </footer>
  );
}
