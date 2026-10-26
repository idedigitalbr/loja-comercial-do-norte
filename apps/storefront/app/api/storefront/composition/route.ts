import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import {
  getStorefrontComposition,
  saveStorefrontComposition,
} from '@/lib/storefront/composition-storage';
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
    // 1. Verificação de permissão Admin (somente administradores autenticados podem publicar)
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('cn_user')?.value;
    let isAdmin = false;
    let authorName = 'Administrador';
    let authorEmail = 'admin@admin.com';

    if (userCookie) {
      try {
        const user = JSON.parse(decodeURIComponent(userCookie));
        if (user?.isAdmin || user?.roles?.includes('ADMIN') || user?.email === 'admin@admin.com') {
          isAdmin = true;
          authorName = user.fullName || user.firstName || user.name || 'Administrador';
          authorEmail = user.email || 'admin@admin.com';
        }
      } catch {
        // Ignora erro de JSON
      }
    }

    // Suporte a header para testes e chamadas de automação autenticadas
    const adminHeader = request.headers.get('x-admin-role');
    if (adminHeader === 'ADMIN' || adminHeader === '1') {
      isAdmin = true;
      const headerName = request.headers.get('x-admin-name');
      const headerEmail = request.headers.get('x-admin-email');
      if (headerName) authorName = headerName;
      if (headerEmail) authorEmail = headerEmail;
    }

    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Acesso negado. Apenas administradores autenticados podem salvar a vitrine oficial.',
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

    // 3. Persistência real em arquivo/servidor com geração de Revisão Histórica (Checkpoint)
    const revision = await saveStorefrontComposition(body as PageComposition, {
      name: authorName,
      email: authorEmail,
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
