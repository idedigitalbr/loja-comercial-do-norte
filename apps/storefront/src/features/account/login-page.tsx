import { FormEvent, useEffect, useState } from 'react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    void fetch('/api/v1/auth/me', { credentials: 'include' })
      .then(async (response) => (response.ok ? response.json() : null))
      .then((payload: { user?: { email?: string } } | null) => {
        if (payload?.user?.email) setCurrentUser(payload.user.email);
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
      if (!response.ok) throw new Error('E-mail ou senha inválidos.');
      const payload = (await response.json()) as { user?: { email?: string } };
      setCurrentUser(payload.user?.email ?? email);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-section account-page">
      <div className="site-container">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Área do cliente</p>
            <h1>Entrar na conta</h1>
          </div>
          <p>Acompanhe pedidos, mantenha seus dados atualizados e agilize sua próxima compra.</p>
        </div>
        {currentUser ? <p className="form-success">Sessão ativa: {currentUser}</p> : null}
        <form className="form-panel" aria-label="Entrar na conta" onSubmit={submit}>
          <label>
            E-mail
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            Senha
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <button className="button button--primary" type="submit" disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  );
}
