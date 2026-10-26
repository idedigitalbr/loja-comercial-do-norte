import { cookies } from 'next/headers';
import { API_URL } from '@/lib/api';

export type AdminAuthResult = {
  isAdmin: boolean;
  authorName: string;
  authorEmail: string;
  reason?: string;
  headers?: Record<string, string>;
};

/**
 * Valida autorização administrativa com distinção estrita por ambiente:
 * - Em Produção / Vercel: valida a sessão real do NestJS e settings.manage.
 * - Em Desenvolvimento / Testes locais: Permite os atalhos de conveniência (cookie `cn_user` e `x-admin-role`)
 *   para preservar o trabalho autônomo dos agentes e os testes automatizados sem login manual.
 */
export async function verifyAdminAuthorization(request: Request): Promise<AdminAuthResult> {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  const cookieStore = await cookies();

  // 1. Verificação de sessão real NestJS (válida tanto em dev quanto em prod)
  const sessionToken =
    cookieStore.get('je_access')?.value ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  if (sessionToken) {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/me`, {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          accept: 'application/json',
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(10_000),
      });

      if (response.ok) {
        const { user: userData } = await response.json();
        const hasAdminRole =
          userData?.permissions?.includes('settings.manage');

        if (hasAdminRole) {
          return {
            isAdmin: true,
            authorName: userData.fullName || userData.firstName || 'Administrador',
            authorEmail: userData.email || 'admin@admin.com',
            headers: { Authorization: `Bearer ${sessionToken}` },
          };
        }
      }
    } catch {
      // Se a API estiver offline temporariamente, segue para as checagens seguintes
    }
  }

  // 2. Conveniência exclusiva de desenvolvimento; cron não concede RBAC no Nest.
  const serverSecret = process.env.CRON_SECRET || process.env.COOKIE_SECRET;
  const adminSecretHeader = request.headers.get('x-admin-secret');
  if (!isProduction && serverSecret && adminSecretHeader && adminSecretHeader === serverSecret) {
    return {
      isAdmin: true,
      authorName: request.headers.get('x-admin-name') || 'Serviço Autorizado',
      authorEmail: request.headers.get('x-admin-email') || 'servico@comercialdonorte.local',
    };
  }

  // 3. Em PRODUÇÃO (Deploy público na Vercel): BLOQUEIA atalhos inseguros!
  if (isProduction) {
    return {
      isAdmin: false,
      authorName: 'Anônimo',
      authorEmail: 'anonimo@bloqueado.com',
      reason: 'Acesso negado. Sessão administrativa válida exigida no ambiente de produção.',
    };
  }

  // 4. Em DESENVOLVIMENTO / TESTES LOCAIS (Preserva fluxo dos agentes e testes sem login manual):
  const adminHeader = request.headers.get('x-admin-role');
  if (adminHeader === 'ADMIN' || adminHeader === '1') {
    return {
      isAdmin: true,
      authorName: request.headers.get('x-admin-name') || 'Administrador Dev',
      authorEmail: request.headers.get('x-admin-email') || 'admin@admin.com',
    };
  }

  const userCookie = cookieStore.get('cn_user')?.value;
  if (userCookie) {
    try {
      const user = JSON.parse(decodeURIComponent(userCookie));
      if (user?.isAdmin || user?.roles?.includes('ADMIN') || user?.email === 'admin@admin.com') {
        return {
          isAdmin: true,
          authorName: user.fullName || user.firstName || user.name || 'Administrador Dev',
          authorEmail: user.email || 'admin@admin.com',
        };
      }
    } catch {
      //
    }
  }

  return {
    isAdmin: false,
    authorName: 'Anônimo',
    authorEmail: 'anonimo@local.com',
    reason: 'Acesso negado. Credenciais de administrador não fornecidas.',
  };
}
