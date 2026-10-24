import Link from 'next/link';
import { BadgeCheck, PackageCheck, ShieldCheck, Truck } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { getCategories, getProducts, getSiteConfig, mediaUrl } from '@/lib/api';
import type { ApiCategory } from '@/lib/types';

export const dynamic = 'force-dynamic';

const benefits = [
  { icon: BadgeCheck, title: 'Menor preço', description: 'Condições de atacado e varejo' },
  { icon: PackageCheck, title: 'Variedade', description: 'Milhares de itens em um só lugar' },
  { icon: Truck, title: 'Tudo em um só lugar', description: 'Embalagens, festa, limpeza e mercearia' },
  { icon: ShieldCheck, title: 'Clientes satisfeitos', description: 'Atendimento próximo da equipe comercial' },
];

export default async function HomePage() {
  const [config, categories, products] = await Promise.all([getSiteConfig(), getCategories(), getProducts()]);
  const banners = config?.banners ?? [];
  const hero = banners[0];
  const highlights = products.slice(0, 8);
  const categoryCount = new Map<string, number>();
  for (const product of products) {
    for (const entry of product.categories) {
      categoryCount.set(entry.category.slug, (categoryCount.get(entry.category.slug) ?? 0) + 1);
    }
  }

  return (
    <div className="pb-8">
      {hero ? (
        <section className="bg-deep">
          <div className="cn-container grid items-center gap-6 py-10 md:grid-cols-2">
            <div className="text-white">
              {hero.eyebrow ? <p className="text-xs font-semibold uppercase tracking-widest text-white/70">{hero.eyebrow}</p> : null}
              <h1 className="mt-3 text-3xl font-extrabold leading-tight md:text-4xl">{hero.title}</h1>
              {hero.description ? <p className="mt-3 max-w-xl text-white/80">{hero.description}</p> : null}
              <div className="mt-6 flex flex-wrap gap-3">
                <Link className="rounded-pill bg-promo px-5 py-3 text-sm font-bold text-white hover:bg-promo-hover" href={hero.ctaHref ?? '/loja'}>
                  {hero.ctaLabel ?? 'Ver catálogo'}
                </Link>
                <Link className="rounded-pill border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10" href="/cotacao">
                  Como funciona a cotação
                </Link>
              </div>
            </div>
            <div className="relative aspect-[16/9] overflow-hidden rounded-card bg-white/10">
              {mediaUrl(hero.desktopPath) ? (
                <img alt={hero.title ?? 'Campanha'} className="size-full object-cover" src={mediaUrl(hero.desktopPath)!} />
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <section aria-label="Benefícios" className="border-b border-line bg-surface">
        <div className="cn-container grid grid-cols-2 gap-4 py-6 md:grid-cols-4">
          {benefits.map(({ icon: Icon, title, description }) => (
            <div className="flex items-center gap-3" key={title}>
              <span className="rounded-pill bg-brand-soft p-2 text-brand"><Icon aria-hidden className="size-5" /></span>
              <div>
                <p className="text-sm font-bold text-ink">{title}</p>
                <p className="text-xs text-muted">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cn-container py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-ink">Categorias</h2>
            <p className="text-sm text-muted">Tudo para o seu negócio ou para a sua festa.</p>
          </div>
          <Link className="text-sm font-semibold text-brand hover:underline" href="/loja">Ver catálogo completo</Link>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {categories.map((category: ApiCategory) => (
            <Link
              className="group rounded-card border border-line bg-surface p-4 shadow-card transition hover:-translate-y-0.5 hover:border-brand"
              href={`/categoria/${category.slug}`}
              key={category.id}
            >
              <p className="text-sm font-bold text-ink group-hover:text-brand">{category.name}</p>
              <p className="mt-1 text-xs text-muted">
                {categoryCount.get(category.slug) ?? 0} produto(s)
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="cn-container py-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-ink">Destaques do catálogo</h2>
            <p className="text-sm text-muted">Preços de referência — a cotação confirma valores e disponibilidade.</p>
          </div>
        </div>
        {highlights.length ? (
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            {highlights.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <p className="mt-6 rounded-card border border-dashed border-line bg-surface p-6 text-sm text-muted">
            Nenhum produto publicado ainda. Rode o seed de demonstração para popular o catálogo.
          </p>
        )}
      </section>

      <section className="cn-container py-10">
        <div className="grid gap-4 rounded-card bg-brand p-6 text-white md:grid-cols-3 md:p-8">
          <div className="md:col-span-2">
            <h2 className="text-xl font-extrabold">Como funciona a cotação</h2>
            <ol className="mt-3 grid gap-2 text-sm text-white/85">
              <li>1. Escolha os produtos e adicione à cotação.</li>
              <li>2. Envie seu nome, WhatsApp e observações — sem criar conta.</li>
              <li>3. A equipe comercial responde com a proposta; o fechamento é feito com a loja.</li>
            </ol>
            <p className="mt-3 text-xs text-white/70">Nenhum pagamento é feito pelo site nesta fase.</p>
          </div>
          <div className="flex items-center">
            <Link className="w-full rounded-pill bg-white px-5 py-3 text-center text-sm font-bold text-brand hover:bg-white/90" href="/loja">
              Começar minha lista
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
