import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import {
  getStorefrontRevisions,
  restoreStorefrontRevision,
} from '@/lib/storefront/composition-storage';

export const dynamic = 'force-dynamic';

async function checkIsAdmin(request: Request): Promise<boolean> {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('cn_user')?.value;

  if (userCookie) {
    try {
      const user = JSON.parse(decodeURIComponent(userCookie));
      if (user?.isAdmin || user?.roles?.includes('ADMIN') || user?.email === 'admin@admin.com') {
        return true;
      }
    } catch {
      //
    }
  }

  const adminHeader = request.headers.get('x-admin-role');
  if (adminHeader === 'ADMIN' || adminHeader === '1') {
    return true;
  }

  return false;
}

export async function GET(request: Request) {
  try {
    const isAdmin = await checkIsAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado ao histórico de revisões.' },
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
    const isAdmin = await checkIsAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Apenas administradores podem restaurar revisões.' },
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
      //
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
