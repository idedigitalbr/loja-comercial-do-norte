import { FormEvent, useState } from 'react';
import { Icon } from '@commerce/ui';
import { useAccount } from '../features/account/account-layout';
import { accountApi } from '../features/account/account-client';

export function AccountProfilePage() {
  const { summary, refresh } = useAccount();
  const profile = summary.user.profile;
  const [firstName, setFirstName] = useState(profile?.firstName ?? '');
  const [lastName, setLastName] = useState(profile?.lastName ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await accountApi.updateProfile({ firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim() });
      await refresh();
      setMessage('Seus dados foram atualizados.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar seus dados.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="account-page-content">
      <div className="account-content-heading">
        <div>
          <p className="eyebrow">Perfil e contato</p>
          <h2>Meus dados</h2>
          <p>Mantenha suas informações atualizadas para facilitar seus próximos pedidos.</p>
        </div>
      </div>
      <form className="account-form account-panel" noValidate onSubmit={submit}>
        <div className="account-form__intro">
          <span className="account-panel-icon"><Icon name="user" size={20} strokeWidth={1.8} /></span>
          <div>
            <h3>Informações pessoais</h3>
            <p>Esses dados são usados para identificar sua conta e entrar em contato sobre os pedidos.</p>
          </div>
        </div>
        <div className="account-form__grid">
          <label>Nome<input autoComplete="given-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} required maxLength={80} /></label>
          <label>Sobrenome<input autoComplete="family-name" value={lastName} onChange={(event) => setLastName(event.target.value)} required maxLength={80} /></label>
          <label>WhatsApp / telefone<input autoComplete="tel" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={20} placeholder="(96) 98100-1897" /></label>
          <label>E-mail <span className="account-field-hint">não editável</span><input type="email" value={summary.user.email} readOnly /></label>
        </div>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        {message ? <p className="form-success" role="status"><Icon name="check-circle-2" size={16} strokeWidth={1.9} />{message}</p> : null}
        <div className="account-form__footer">
          <span>Última atualização protegida pela sua sessão.</span>
          <button className="button button--primary" type="submit" disabled={saving}>{saving ? 'Salvando…' : 'Salvar alterações'}</button>
        </div>
      </form>
    </div>
  );
}
