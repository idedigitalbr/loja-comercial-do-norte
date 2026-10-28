import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function MaisVendidosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const resolved = await searchParams;
  const params = new URLSearchParams();
  Object.entries(resolved).forEach(([key, val]) => {
    if (val !== undefined) params.set(key, val);
  });
  params.set('ordem', 'mais_vendidos');
  redirect(`/loja?${params.toString()}`);
}
