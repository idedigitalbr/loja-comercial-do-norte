import { FormEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { emitAuthUpdated, getCurrentUser, login } from './auth-client';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    void getCurrentUser().then((user) => {
      if (user) {
        setCurrentUser(user.email);
        navigate(getReturnTo(location.search), { replace: true });
      }
    });
  }, [location.search, navigate]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login({ email, password });
      setCurrentUser(user.email);
      emitAuthUpdated();
      navigate(getReturnTo(location.search), { replace: true });
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
        {new URLSearchParams(location.search).get('passwordChanged') === '1' ? <p className="form-success" role="status">Senha atualizada. Entre novamente para continuar.</p> : null}
        <form className="form-panel" aria-label="Entrar na conta" noValidate onSubmit={submit}>
          <label>
            E-mail
            <input autoComplete="email" autoFocus type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            Senha
            <input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
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

function getReturnTo(search: string) {
  const candidate = new URLSearchParams(search).get('returnTo');
  return candidate && candidate.startsWith('/') && !candidate.startsWith('//') ? candidate : '/conta';
}
