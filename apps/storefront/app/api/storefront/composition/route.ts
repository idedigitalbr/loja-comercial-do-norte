import { NextResponse } from 'next/server';
import { defaultHomeComposition } from '@/lib/storefront/home-configuration';
import type { PageComposition } from '@/lib/storefront/widget-types';

// Cache em memória compartilhado no servidor Next.js
let serverStoredComposition: PageComposition | null = null;

export async function GET() {
  return NextResponse.json({
    success: true,
    data: serverStoredComposition || defaultHomeComposition,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || !Array.isArray(body.widgets)) {
      return NextResponse.json(
        { success: false, error: 'Composição de widgets inválida' },
        { status: 400 }
      );
    }

    serverStoredComposition = body as PageComposition;

    return NextResponse.json({
      success: true,
      message: 'Composição da vitrine salva no servidor com sucesso!',
      updatedAt: new Date().toISOString(),
      widgetsCount: body.widgets.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Falha ao salvar no servidor' },
      { status: 500 }
    );
  }
}
