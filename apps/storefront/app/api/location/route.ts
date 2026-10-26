import { NextResponse } from 'next/server';
import {
  cleanCep,
  normalizeBrasilApi,
  normalizeViaCep,
} from '@/lib/location';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cepParam = searchParams.get('cep');
  const ufParam = searchParams.get('uf');
  const cityParam = searchParams.get('city');
  const streetParam = searchParams.get('street');

  // CASO 1: Consulta por CEP
  if (cepParam) {
    const digits = cleanCep(cepParam);
    if (digits.length !== 8) {
      return NextResponse.json(
        { success: false, error: 'CEP inválido. Deve conter 8 dígitos numéricos.' },
        { status: 400 }
      );
    }

    // 1. Tenta BrasilAPI com timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const brasilRes = await fetch(`https://brasilapi.com.br/api/cep/v2/${digits}`, {
        signal: controller.signal,
        headers: { 'User-Agent': 'ComercialDoNorte-Storefront' },
      });
      clearTimeout(timeoutId);

      if (brasilRes.ok) {
        const data = await brasilRes.json();
        const location = normalizeBrasilApi(data);
        return NextResponse.json(
          { success: true, data: location },
          {
            headers: {
              'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
            },
          }
        );
      }
    } catch {
      // Falha rápida, segue para ViaCEP
    }

    // 2. Fallback ViaCEP
    try {
      const viaRes = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
        headers: { 'User-Agent': 'ComercialDoNorte-Storefront' },
      });
      if (viaRes.ok) {
        const data = await viaRes.json();
        if (data && !data.erro) {
          const location = normalizeViaCep(data);
          return NextResponse.json(
            { success: true, data: location },
            {
              headers: {
                'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
              },
            }
          );
        }
      }
    } catch {
      // Ignora erro
    }

    return NextResponse.json(
      {
        success: false,
        error: 'CEP não encontrado. Verifique o número digitado ou busque pelo nome da rua.',
      },
      { status: 404 }
    );
  }

  // CASO 2: Busca por Endereço (UF + Cidade + Rua)
  if (ufParam && cityParam && streetParam) {
    const uf = ufParam.trim().toUpperCase();
    const city = cityParam.trim();
    const street = streetParam.trim();

    if (uf.length !== 2 || city.length < 3 || street.length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parâmetros insuficientes: UF com 2 letras, cidade e rua com mínimo de 3 caracteres.',
        },
        { status: 400 }
      );
    }

    try {
      const url = `https://viacep.com.br/ws/${uf}/${encodeURIComponent(city)}/${encodeURIComponent(street)}/json/`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'ComercialDoNorte-Storefront' },
      });

      if (!res.ok) {
        return NextResponse.json(
          { success: false, error: 'Erro ao consultar serviço de endereços.' },
          { status: 502 }
        );
      }

      const list = await res.json();
      if (!Array.isArray(list)) {
        return NextResponse.json({ success: true, results: [] });
      }

      const normalized = list.slice(0, 20).map(normalizeViaCep);
      return NextResponse.json(
        { success: true, results: normalized },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
          },
        }
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro interno';
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
  }

  return NextResponse.json(
    {
      success: false,
      error: 'Informe ?cep=... ou ?uf=...&city=...&street=...',
    },
    { status: 400 }
  );
}
