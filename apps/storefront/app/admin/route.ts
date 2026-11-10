import { NextResponse } from 'next/server';

export async function GET() {
  const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
  const defaultUrl = isProd
    ? 'https://admin-comercialdonorte.vercel.app'
    : 'http://localhost:5174/admin/';
  const adminUrl = (process.env.NEXT_PUBLIC_ADMIN_URL || defaultUrl).trim();
  return NextResponse.redirect(adminUrl, 307);
}
