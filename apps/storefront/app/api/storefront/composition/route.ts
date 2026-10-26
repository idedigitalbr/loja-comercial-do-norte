import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  getStorefrontComposition,
  saveStorefrontComposition,
} from '@/lib/storefront/composition-storage';
import { verifyAdminAuthorization } from '@/lib/auth/admin-guard';
import type { PageComposition } from '@/lib/storefront/widget-types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getStorefrontComposition();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Falha ao recuperar composição da vitrine' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // 1. Verificação de permissão Admin segura por ambiente
    const authResult = await verifyAdminAuthorization(request);

    if (!authResult.isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error:
            authResult.reason ||
            'Acesso negado. Apenas administradores autenticados podem salvar a vitrine oficial.',
        },
        { status: 403 }
      );
    }

    // 2. Validação da composição recebida
    const body = await request.json();
    if (!body || !Array.isArray(body.widgets) || body.widgets.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Composição de widgets inválida' },
        { status: 400 }
      );
    }

    // 3. Persistência real (Neon PostgreSQL em produção + fallback em disco local) com geração de Revisão
    const revision = await saveStorefrontComposition(body as PageComposition, {
      name: authResult.authorName,
      email: authResult.authorEmail,
      note: `Atualização de vitrine (${body.widgets.length} seções ativas)`,
    });

    // 4. Revalida o cache ISR da página inicial no Next.js
    try {
      revalidatePath('/');
    } catch {
      // Ignora erro em ambientes de teste sem request context
    }

    return NextResponse.json({
      success: true,
      message: 'Composição da vitrine salva no servidor com sucesso!',
      updatedAt: revision.createdAt,
      widgetsCount: body.widgets.length,
      revision: {
        id: revision.id,
        authorName: revision.authorName,
        authorEmail: revision.authorEmail,
        createdAt: revision.createdAt,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Falha ao salvar no servidor' },
      { status: 500 }
    );
  }
}
