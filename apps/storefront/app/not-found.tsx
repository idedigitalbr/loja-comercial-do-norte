import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="cn-container flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted">Erro 404</p>
      <h1 className="mt-2 text-2xl font-extrabold text-ink">Página não encontrada</h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        O produto ou a página que você procura não existe, foi despublicado ou mudou de endereço.
      </p>
      <div className="mt-6 flex gap-3">
        <Link className="rounded-pill bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover" href="/loja">
          Ir para o catálogo
        </Link>
        <Link className="rounded-pill border border-line px-4 py-2 text-sm font-semibold text-ink hover:border-brand" href="/">
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
