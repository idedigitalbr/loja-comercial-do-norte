import { FormEvent, useState } from 'react';
import { Icon } from '@commerce/ui';
import { useNavigate } from 'react-router-dom';
import { accountApi } from '../features/account/account-client';
import { emitAuthUpdated } from '../features/account/auth-client';

export function AccountSecurityPage() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (newPassword !== confirmation) {
      setError('A confirmação da senha não confere.');
      return;
    }
    if (newPassword.length < 8) {
      setError('A nova senha precisa ter pelo menos 8 caracteres.');
      return;
    }
    setSaving(true);
    try {
      await accountApi.changePassword({ currentPassword, newPassword });
      emitAuthUpdated();
      navigate('/entrar?passwordChanged=1', { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível alterar sua senha.');
      setSaving(false);
    }
  }

  return (
    <div className="account-page-content">
      <div className="account-content-heading">
        <div>
          <p className="eyebrow">Privacidade e acesso</p>
          <h2>Segurança</h2>
          <p>Atualize sua senha regularmente para manter sua conta protegida.</p>
        </div>
      </div>
      <div className="account-security-grid">
        <form className="account-form account-panel" noValidate onSubmit={submit}>
          <div className="account-form__intro">
            <span className="account-panel-icon"><Icon name="shield-check" size={20} strokeWidth={1.8} /></span>
            <div>
              <h3>Alterar senha</h3>
              <p>Ao salvar uma nova senha, todos os acessos anteriores serão encerrados.</p>
            </div>
          </div>
          <label>Senha atual<input autoComplete="current-password" type={showPasswords ? 'text' : 'password'} value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></label>
          <label>Nova senha<input autoComplete="new-password" type={showPasswords ? 'text' : 'password'} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={8} required /><span className="account-field-hint">Use pelo menos 8 caracteres.</span></label>
          <label>Confirmar nova senha<input autoComplete="new-password" type={showPasswords ? 'text' : 'password'} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} minLength={8} required /></label>
          <label className="account-checkbox"><input type="checkbox" checked={showPasswords} onChange={(event) => setShowPasswords(event.target.checked)} /><span>Mostrar senhas</span></label>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <div className="account-form__footer">
            <span>Você precisará entrar novamente depois da troca.</span>
            <button className="button button--primary" type="submit" disabled={saving}>{saving ? 'Atualizando…' : 'Atualizar senha'}</button>
          </div>
        </form>
        <aside className="account-security-note">
          <span className="account-panel-icon"><Icon name="shield" size={20} strokeWidth={1.8} /></span>
          <h3>Conta protegida</h3>
          <p>Não compartilhe sua senha. O acesso é encerrado em outros dispositivos quando você define uma nova senha.</p>
          <ul>
            <li><Icon name="check" size={15} strokeWidth={2} /> Senha armazenada com proteção criptográfica</li>
            <li><Icon name="check" size={15} strokeWidth={2} /> Sessões antigas revogadas ao trocar a senha</li>
            <li><Icon name="check" size={15} strokeWidth={2} /> Comunicação protegida por HTTPS</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
