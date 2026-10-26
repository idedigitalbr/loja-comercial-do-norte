import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  getStorefrontRevisions,
  restoreStorefrontRevision,
} from '@/lib/storefront/composition-storage';
import { verifyAdminAuthorization } from '@/lib/auth/admin-guard';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authResult = await verifyAdminAuthorization(request);
    if (!authResult.isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error:
            authResult.reason || 'Acesso negado ao histórico de revisões da vitrine.',
        },
        { status: 403 }
      );
    }

    const revisions = await getStorefrontRevisions();
    return NextResponse.json({
      success: true,
      data: revisions,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Falha ao buscar histórico de revisões.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await verifyAdminAuthorization(request);
    if (!authResult.isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error:
            authResult.reason || 'Apenas administradores podem restaurar revisões.',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const revisionId = body?.revisionId;
    if (!revisionId || typeof revisionId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'ID de revisão inválido ou não informado.' },
        { status: 400 }
      );
    }

    const restored = await restoreStorefrontRevision(revisionId);
    if (!restored) {
      return NextResponse.json(
        { success: false, error: 'Revisão não encontrada no histórico.' },
        { status: 404 }
      );
    }

    try {
      revalidatePath('/');
    } catch {
      // Ignora erro em ambiente de teste
    }

    return NextResponse.json({
      success: true,
      message: `Revisão de ${new Date(restored.createdAt).toLocaleString('pt-BR')} restaurada com sucesso!`,
      data: restored,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Falha ao restaurar revisão.' },
      { status: 500 }
    );
  }
}
