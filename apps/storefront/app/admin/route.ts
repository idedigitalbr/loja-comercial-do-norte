import { NextResponse } from 'next/server';

export async function GET() {
  const adminUrl = (process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:5174/admin/').trim();
  return NextResponse.redirect(adminUrl, 307);
}
