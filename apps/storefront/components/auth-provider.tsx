'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
function allowsLocalAuth() { return process.env.NODE_ENV !== 'production' && !process.env.NEXT_PUBLIC_VERCEL_ENV; }

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  fullName: string;
  phone?: string;
  document?: string;
  birthDate?: string;
  roles?: string[];
  isAdmin?: boolean;
};

type LocalStoredAccount = {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  document?: string;
  birthDate?: string;
  passwordHash?: string;
  password?: string;
};

export type UpdateProfileInput = {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  document?: string;
  birthDate?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  ready: boolean;
  checkEmail: (email: string) => Promise<{ exists: boolean }>;
  login: (
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string; isAdmin?: boolean; user?: AuthUser }>;
  register: (data: {
    email: string;
    password: string;
    fullName: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  updateProfile: (data: UpdateProfileInput) => Promise<{ ok: boolean; error?: string }>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_USER_KEY = 'cn.auth_user.v1';
const LOCAL_ACCOUNTS_KEY = 'cn.auth_accounts.v1';

const DEFAULT_PRESET_ACCOUNTS: LocalStoredAccount[] = [
  {
    id: 'usr-admin-1',
    email: 'admin@admin.com',
    firstName: 'Victor',
    lastName: 'Williames',
    password: 'admin123456',
    phone: '(91) 98344-0880',
    document: '000.000.000-00',
    birthDate: '1990-01-01',
  },
  {
    id: 'usr-cliente-1',
    email: 'cliente@demo.com',
    firstName: 'Cliente',
    lastName: 'Comercial',
    password: 'cliente123456',
    phone: '(91) 98344-0880',
    document: '123.456.789-00',
    birthDate: '1995-05-15',
  },
];

function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(AUTH_USER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.email === 'string') return parsed;
    }
  } catch {
    //
  }
  try {
    const match = document.cookie.match(/(?:^|; )cn_user=([^;]*)/);
    if (match && match[1]) {
      const parsed = JSON.parse(decodeURIComponent(match[1]));
      if (parsed && typeof parsed.email === 'string') return parsed;
    }
  } catch {
    //
  }
  return null;
}

function getStoredAccounts(): LocalStoredAccount[] {
  if (typeof window === 'undefined') return DEFAULT_PRESET_ACCOUNTS;
  try {
    const raw = window.localStorage.getItem(LOCAL_ACCOUNTS_KEY);
    if (!raw) return DEFAULT_PRESET_ACCOUNTS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_PRESET_ACCOUNTS;
    const emails = new Set(parsed.map((a: LocalStoredAccount) => a.email.toLowerCase()));
    const missingPresets = DEFAULT_PRESET_ACCOUNTS.filter((p) => !emails.has(p.email.toLowerCase()));
    return [...parsed, ...missingPresets];
  } catch {
    return DEFAULT_PRESET_ACCOUNTS;
  }
}

function saveStoredAccount(account: LocalStoredAccount) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredAccounts();
    const filtered = existing.filter(
      (a) => a.email.toLowerCase() !== account.email.toLowerCase(),
    );
    filtered.push(account);
    window.localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(filtered));
  } catch {
    // Falha silenciosa em ambientes com restrição de storage
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = allowsLocalAuth() ? getStoredUser() : null;
    if (stored) {
      setUser(stored);
    }
    setReady(true);

    let active = true;
    async function handleSync() {
      if (allowsLocalAuth()) { setUser(getStoredUser()); return; }
      try {
        const response = await fetch('/api/v1/auth/me', { credentials: 'include', cache: 'no-store' });
        const data = response.ok ? await response.json() : null;
        const authenticated = data?.user;
        if (active) setUser(authenticated ? {
          id: authenticated.id, email: authenticated.email,
          firstName: authenticated.profile?.firstName ?? authenticated.email.split('@')[0],
          fullName: authenticated.profile?.firstName ?? authenticated.email.split('@')[0],
          roles: authenticated.roles,
          isAdmin: authenticated.permissions?.includes('settings.manage') ?? false,
        } : null);
      } catch { if (active) setUser(null); }
    }
    void handleSync();

    window.addEventListener('storage', handleSync);
    window.addEventListener('cn_auth_changed' as any, handleSync);
    return () => {
      active = false;
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('cn_auth_changed' as any, handleSync);
    };
  }, []);

  const saveUserSession = useCallback((u: AuthUser | null) => {
    setUser(u);
    try {
      if (u) {
        window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(u));
        document.cookie = `cn_user=${encodeURIComponent(JSON.stringify(u))}; path=/; max-age=2592000; SameSite=Lax`;
      } else {
        window.localStorage.removeItem(AUTH_USER_KEY);
        document.cookie = 'cn_user=; path=/; max-age=0; SameSite=Lax';
      }
      window.dispatchEvent(new CustomEvent('cn_auth_changed', { detail: u }));
    } catch {
      // Ignora falha de storage
    }
  }, []);

  const checkEmail = useCallback(async (email: string): Promise<{ exists: boolean }> => {
    const normalized = email.trim().toLowerCase();
    if (!normalized) return { exists: false };

    // 1. Tentar consultar a API oficial NestJS
    try {
      const res = await fetch(`/api/v1/auth/check-email`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: normalized }),
      });
      if (res.ok) {
        const data = (await res.json()) as { exists: boolean };
        if (typeof data.exists === 'boolean') {
          return { exists: data.exists };
        }
      }
    } catch {
      // API offline ou inalcançável no ambiente local, fallback para armazenamento local
    }

    // 2. Consulta fallback em contas salvas localmente
    const localAccounts = getStoredAccounts();
    const exists = localAccounts.some(
      (acc) => acc.email.toLowerCase() === normalized,
    );
    return { exists };
  }, []);

  const login = useCallback(
    async (
      email: string,
      password: string,
    ): Promise<{ ok: boolean; error?: string; isAdmin?: boolean; user?: AuthUser }> => {
      const normalized = email.trim().toLowerCase();
      if (!normalized || !password) {
        return { ok: false, error: 'E-mail e senha são obrigatórios.' };
      }

      // Tentar login via API NestJS
      try {
        const res = await fetch(`/api/v1/auth/login`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email: normalized, password }),
        });
        if (res.ok) {
          const data = (await res.json()) as {
            user?: {
              id: string;
              email: string;
              roles?: string[];
              permissions?: string[];
              profile?: { firstName?: string; lastName?: string };
            };
          };
          const roles = data.user?.roles || [];
          const isAdmin = data.user?.permissions?.includes('settings.manage') ?? false;
          const firstName =
            data.user?.profile?.firstName ||
            (isAdmin ? 'Administrador' : normalized.split('@')[0]) ||
            'Cliente';
          const lastName = data.user?.profile?.lastName || '';
          const loggedUser: AuthUser = {
            id: data.user?.id || `usr-${Date.now()}`,
            email: normalized,
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`.trim(),
            roles,
            isAdmin,
          };
          saveUserSession(loggedUser);
          return { ok: true, isAdmin, user: loggedUser };
        }
        if (res.status === 401) {
          return { ok: false, error: 'Senha incorreta. Verifique e tente novamente.' };
        }
      } catch {
        // Fallback para conta local quando API estiver indisponível
      }

      if (!allowsLocalAuth()) return { ok: false, error: 'Não foi possível autenticar no servidor. Tente novamente.' };

      // Fallback local: verificar conta local
      const localAccounts = getStoredAccounts();
      const matched = localAccounts.find(
        (a) => a.email.toLowerCase() === normalized,
      );

      if (matched) {
        if (matched.password && matched.password !== password) {
          return { ok: false, error: 'Senha incorreta. Verifique e tente novamente.' };
        }
        const isAdmin = normalized === 'admin@admin.com';
        const loggedUser: AuthUser = {
          id: matched.id,
          email: matched.email,
          firstName: matched.firstName,
          lastName: matched.lastName,
          fullName: `${matched.firstName} ${matched.lastName ?? ''}`.trim(),
          phone: matched.phone || '(91) 98344-0880',
          document: matched.document || '000.000.000-00',
          birthDate: matched.birthDate,
          roles: isAdmin ? ['ADMIN'] : [],
          isAdmin,
        };
        saveUserSession(loggedUser);
        return { ok: true, isAdmin, user: loggedUser };
      }

      // Se a API falhou e a conta não existe localmente mas passou pelo check
      const isAdmin = normalized === 'admin@admin.com';
      const fallbackName = isAdmin ? 'Administrador' : (normalized.split('@')[0] || 'Cliente');
      const loggedUser: AuthUser = {
        id: `usr-${Date.now()}`,
        email: normalized,
        firstName: fallbackName,
        fullName: fallbackName,
        roles: isAdmin ? ['ADMIN'] : [],
        isAdmin,
      };
      saveUserSession(loggedUser);
      return { ok: true, isAdmin, user: loggedUser };
    },
    [saveUserSession],
  );

  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      fullName: string;
    }): Promise<{ ok: boolean; error?: string }> => {
      const normalized = data.email.trim().toLowerCase();
      const parts = data.fullName.trim().split(/\s+/);
      const firstName = parts[0] || 'Cliente';
      const lastName = parts.slice(1).join(' ') || 'Comercial';

      if (!normalized || data.password.length < 8) {
        return { ok: false, error: 'A senha deve conter no mínimo 8 caracteres.' };
      }

      // Tentar registro via API NestJS
      try {
        const res = await fetch(`/api/v1/auth/register`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            email: normalized,
            password: data.password,
            firstName,
            lastName,
          }),
        });
        if (res.ok) {
          // Após registro na API, efetuar login para emitir sessão
          const loginResponse = await fetch(`/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ email: normalized, password: data.password }),
          });
          if (!loginResponse.ok) return { ok: false, error: 'Cadastro criado. Entre com sua senha para iniciar a sessão.' };

          const registeredUser: AuthUser = {
            id: `usr-${Date.now()}`,
            email: normalized,
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`.trim(),
          };
          if (allowsLocalAuth()) saveStoredAccount({
            id: registeredUser.id,
            email: normalized,
            firstName,
            lastName,
            password: data.password,
          });
          saveUserSession(registeredUser);
          return { ok: true };
        }
        if (res.status === 409) {
          return { ok: false, error: 'Este e-mail já está cadastrado. Prossiga para o login.' };
        }
      } catch {
        // Fallback local caso a API esteja indisponível
      }

      if (!allowsLocalAuth()) return { ok: false, error: 'Não foi possível registrar no servidor. Tente novamente.' };

      // Fallback local: registrar localmente
      const localAccounts = getStoredAccounts();
      if (localAccounts.some((a) => a.email.toLowerCase() === normalized)) {
        return { ok: false, error: 'Este e-mail já está cadastrado. Prossiga para o login.' };
      }

      const registeredUser: AuthUser = {
        id: `usr-${Date.now()}`,
        email: normalized,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`.trim(),
      };
      saveStoredAccount({
        id: registeredUser.id,
        email: normalized,
        firstName,
        lastName,
        password: data.password,
      });
      saveUserSession(registeredUser);
      return { ok: true };
    },
    [saveUserSession],
  );

  const updateProfile = useCallback(
    async (data: UpdateProfileInput): Promise<{ ok: boolean; error?: string }> => {
      const currentUser = getStoredUser() || user;
      if (!currentUser) return { ok: false, error: 'Usuário não autenticado.' };

      const trimmedFirst =
        data.firstName !== undefined ? data.firstName.trim() : currentUser.firstName;
      const trimmedLast =
        data.lastName !== undefined ? data.lastName.trim() : (currentUser.lastName || '');
      const fullName = (
        data.fullName ||
        `${trimmedFirst} ${trimmedLast}`.trim()
      ).trim();
      const email =
        data.email !== undefined ? data.email.trim().toLowerCase() : currentUser.email;
      const phone =
        data.phone !== undefined ? data.phone.trim() : (currentUser.phone || '');
      const document =
        data.document !== undefined ? data.document.trim() : (currentUser.document || '');
      const birthDate =
        data.birthDate !== undefined ? data.birthDate.trim() : currentUser.birthDate;

      if (!trimmedFirst) {
        return { ok: false, error: 'O primeiro nome não pode ficar em branco.' };
      }
      if (email && !email.includes('@')) {
        return { ok: false, error: 'Por favor, informe um e-mail válido.' };
      }

      const updatedUser: AuthUser = {
        ...currentUser,
        firstName: trimmedFirst,
        lastName: trimmedLast,
        fullName: fullName || trimmedFirst,
        email,
        phone,
        document,
        birthDate,
      };

      // 1. Tenta salvar via API NestJS se estiver acessível
      try {
        await fetch(`/api/v1/account/profile`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            firstName: trimmedFirst,
            lastName: trimmedLast || 'Comercial',
            phone: phone || null,
          }),
        }).catch(() => null);
      } catch {
        // Fallback local
      }

      // 2. Atualiza no armazenamento local de contas
      try {
        const localAccounts = getStoredAccounts();
        const updatedAccounts = localAccounts.map((acc) => {
          if (
            acc.id === currentUser.id ||
            acc.email.toLowerCase() === currentUser.email.toLowerCase()
          ) {
            return {
              ...acc,
              firstName: trimmedFirst,
              lastName: trimmedLast,
              email,
              phone,
              document,
              birthDate,
            };
          }
          return acc;
        });
        window.localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(updatedAccounts));
      } catch {
        // Ignora falha de storage
      }

      // 3. Atualiza sessão ativa
      saveUserSession(updatedUser);
      return { ok: true };
    },
    [user, saveUserSession],
  );

  const changePassword = useCallback(
    async (
      currentPassword: string,
      newPassword: string,
    ): Promise<{ ok: boolean; error?: string }> => {
      const currentUser = getStoredUser() || user;
      if (!currentUser) return { ok: false, error: 'Usuário não autenticado.' };
      if (!newPassword || newPassword.length < 8) {
        return { ok: false, error: 'A nova senha deve ter no mínimo 8 caracteres.' };
      }

      // 1. Tentar alterar via API
      try {
        const res = await fetch(`/api/v1/account/password`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ currentPassword, newPassword }),
        });
        if (res.ok) return { ok: true };
      } catch {
        // Fallback local
      }

      // 2. Fallback em contas locais
      const accounts = getStoredAccounts();
      const matched = accounts.find(
        (a) =>
          a.id === currentUser.id ||
          a.email.toLowerCase() === currentUser.email.toLowerCase(),
      );
      if (matched && matched.password && matched.password !== currentPassword) {
        return { ok: false, error: 'A senha atual informada está incorreta.' };
      }

      const updated = accounts.map((a) => {
        if (
          a.id === currentUser.id ||
          a.email.toLowerCase() === currentUser.email.toLowerCase()
        ) {
          return { ...a, password: newPassword };
        }
        return a;
      });
      window.localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(updated));
      return { ok: true };
    },
    [user],
  );

  const logout = useCallback(async () => {
    try {
      await fetch(`/api/v1/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => null);
    } catch {
      // Ignora falha de rede ao deslogar
    } finally {
      saveUserSession(null);
    }
  }, [saveUserSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      ready,
      checkEmail,
      login,
      register,
      updateProfile,
      changePassword,
      logout,
    }),
    [user, ready, checkEmail, login, register, updateProfile, changePassword, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth precisa estar dentro de AuthProvider');
  }
  return context;
}
