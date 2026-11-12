import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  clearLocalDraft,
  getStorefrontCompositionInfo,
  saveStorefrontComposition,
} from '@/lib/storefront/composition-storage';
import { defaultHomeComposition } from '@/lib/storefront/home-configuration';
import { verifyAdminAuthorization } from '@/lib/auth/admin-guard';
import {
  sanitizeCompositionProps,
  validateSameOriginRequest,
} from '@/lib/storefront/url-security';
import type { PageComposition } from '@/lib/storefront/widget-types';


export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const info = await getStorefrontCompositionInfo();
    return NextResponse.json({
      success: true,
      data: info.composition,
      isDraft: info.isDraft,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Falha ao recuperar composição da vitrine' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const sameOrigin = validateSameOriginRequest(request);
    if (!sameOrigin.allowed) {
      return NextResponse.json({ success: false, error: sameOrigin.reason || 'Origem não autorizada.' }, { status: 403 });
    }
    const authResult = await verifyAdminAuthorization(request);
    const isProductionEnv = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    // Em dev local ou admin autenticado, permite exclusão do rascunho
    if (!authResult.isAdmin && isProductionEnv) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado para excluir rascunho' },
        { status: 403 }
      );
    }
    await clearLocalDraft();
    revalidatePath('/');
    return NextResponse.json({
      success: true,
      message: 'Rascunho local excluído com sucesso. A vitrine foi restaurada para a versão oficial.',
      data: defaultHomeComposition,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Falha ao excluir rascunho da vitrine' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const sameOrigin = validateSameOriginRequest(request);
    if (!sameOrigin.allowed) {
      return NextResponse.json({ success: false, error: sameOrigin.reason || 'Origem não autorizada.' }, { status: 403 });
    }
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

    // 2. Validação e sanitização da composição recebida
    const rawBody = await request.json();
    if (
      !rawBody ||
      typeof rawBody !== 'object' ||
      rawBody.page !== 'home' ||
      !Array.isArray(rawBody.widgets) ||
      rawBody.widgets.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: 'Composição de widgets inválida' },
        { status: 400 }
      );
    }
    const body = sanitizeCompositionProps(rawBody as PageComposition);

    // 3. Persistência real (Neon PostgreSQL em produção + fallback em disco local) com geração de Revisão
    const revision = await saveStorefrontComposition(body, {
      name: authResult.authorName,
      email: authResult.authorEmail,
      note: `Atualização de vitrine (${body.widgets.length} seções ativas)`,
    }, authResult.headers);

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
      { success: false, error: 'Falha ao confirmar publicação no servidor. Tente novamente.' },
      { status: 500 }
    );
  }
}
