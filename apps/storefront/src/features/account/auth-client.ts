export type AuthUser = {
  email: string;
  publicId?: string;
};

export const AUTH_UPDATED_EVENT = 'je-auth-updated';

function parseUser(payload: unknown): AuthUser | null {
  if (!payload || typeof payload !== 'object') return null;
  const candidate = (payload as { user?: unknown }).user;
  if (!candidate || typeof candidate !== 'object') return null;
  const user = candidate as { email?: unknown; publicId?: unknown };
  if (typeof user.email !== 'string' || !user.email.trim()) return null;
  return {
    email: user.email,
    ...(typeof user.publicId === 'string' ? { publicId: user.publicId } : {}),
  };
}

async function parseResponseUser(response: Response): Promise<AuthUser | null> {
  try {
    return parseUser(await response.json());
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const response = await fetch('/api/v1/auth/me', { credentials: 'include' });
    if (response.ok) return parseResponseUser(response);
    if (response.status !== 401) return null;

    const refreshResponse = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });
    if (!refreshResponse.ok) return null;
    return parseResponseUser(refreshResponse);
  } catch {
    return null;
  }
}

export async function login(input: { email: string; password: string }): Promise<AuthUser> {
  let response: Response;
  try {
    response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error('Não foi possível entrar. Tente novamente.');
  }

  if (!response.ok) throw new Error('E-mail ou senha inválidos.');
  const user = await parseResponseUser(response);
  if (!user) throw new Error('Não foi possível entrar. Tente novamente.');
  return user;
}

export async function logout(): Promise<void> {
  let response: Response;
  try {
    response = await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' });
  } catch {
    throw new Error('Não foi possível sair da conta. Tente novamente.');
  }
  if (!response.ok) throw new Error('Não foi possível sair da conta. Tente novamente.');
}

export function emitAuthUpdated() {
  window.dispatchEvent(new Event(AUTH_UPDATED_EVENT));
}
