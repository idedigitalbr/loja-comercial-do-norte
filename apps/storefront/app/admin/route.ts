import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/api';

export async function GET() {
  const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
  const defaultUrl = isProd
    ? 'https://admin-comercialdonorte.vercel.app'
    : 'http://localhost:5174/admin/';
  const adminUrl = (process.env.NEXT_PUBLIC_ADMIN_URL || defaultUrl).trim();

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('je_access')?.value;
    if (token) {
      const response = await fetch(`${API_URL}/api/v1/auth/admin-handoff`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          accept: 'application/json',
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(3_000),
      });
      if (response.ok) {
        const data = (await response.json()) as { code?: string };
        if (data?.code) {
          const cleanBase = adminUrl.split('#')[0];
          return NextResponse.redirect(`${cleanBase}#handoff=${encodeURIComponent(data.code)}`, 307);
        }
      }
    }
  } catch {
    // Fallback para redirecionamento padrão caso a API não emita handoff
  }

  return NextResponse.redirect(adminUrl, 307);
}
