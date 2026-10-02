import { FormEvent, useEffect, useState } from 'react';

type AuthenticatedUser = { email?: string; roles?: string[] };

function isAdminUser(user: AuthenticatedUser | undefined): user is AuthenticatedUser & { email: string } {
  return Boolean(user?.email && user.roles?.includes('ADMIN'));
}

export function LoginPage({ onAuthenticated }: { onAuthenticated: (email: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    void fetch('/api/v1/auth/me', { credentials: 'include' })
      .then(async (response) => (response.ok ? response.json() : null))
      .then((payload: { user?: AuthenticatedUser } | null) => {
        if (isAdminUser(payload?.user)) {
          setCurrentUser(payload.user.email);
          onAuthenticated(payload.user.email);
        } else if (payload?.user?.email) {
          setError('Esta conta não possui acesso ao painel administrativo.');
        }
      });
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error('Não foi possível entrar.');
      const payload = (await response.json()) as { user?: AuthenticatedUser };
      if (!isAdminUser(payload.user)) throw new Error('Esta conta não possui acesso ao painel administrativo.');
      const authenticatedEmail = payload.user.email;
      setCurrentUser(authenticatedEmail);
      onAuthenticated(authenticatedEmail);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-shell">
      <main className="admin-auth">
        <section className="admin-auth__brand" aria-label="Identidade do painel">
          <p className="admin-eyebrow">Jonas & Elivaldo</p>
          <h1>Gestão profissional para uma operação mais leve.</h1>
          <p>Catálogo, pedidos, estoque e relacionamento em um só lugar.</p>
        </section>
        <section className="admin-auth__card">
          <p className="admin-eyebrow">Área restrita</p>
          <h2>Acesso administrativo</h2>
          {currentUser ? <p className="admin-success">Sessão ativa: {currentUser}</p> : null}
          <form className="admin-form" aria-label="Acesso administrativo" noValidate onSubmit={submit}>
            <label>
              E-mail
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label>
              Senha
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </label>
            {error ? <p className="admin-error" role="alert">{error}</p> : null}
            <button className="admin-button" type="submit" disabled={loading}>
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
