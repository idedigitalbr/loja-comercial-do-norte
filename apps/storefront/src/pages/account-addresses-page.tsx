import { FormEvent, useEffect, useState } from 'react';
import { Icon } from '@commerce/ui';
import { AccountAddress, accountApi } from '../features/account/account-client';
import { AccountAddressCard, AccountEmptyState, ConfirmDialog } from '../features/account/account-components';
import { formatPostalCode } from '../features/account/account-presenters';
import { lookupPostalCode } from '../features/account/cep-client';

type AddressForm = { label: string; recipientName: string; street: string; number: string; complement: string; district: string; city: string; state: string; postalCode: string; isDefault: boolean };
const emptyForm: AddressForm = { label: '', recipientName: '', street: '', number: '', complement: '', district: '', city: '', state: '', postalCode: '', isDefault: false };

export function AccountAddressesPage() {
  const [addresses, setAddresses] = useState<AccountAddress[]>([]);
  const [form, setForm] = useState<AddressForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<AccountAddress | null>(null);
  const [postalLookup, setPostalLookup] = useState<'idle' | 'loading' | 'success' | 'not-found' | 'error'>('idle');

  async function loadAddresses() {
    setLoading(true); setError('');
    try { setAddresses(await accountApi.addresses()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível carregar seus endereços.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { void loadAddresses(); }, []);
  useEffect(() => {
    const digits = form.postalCode.replace(/\D/g, '');
    if (digits.length !== 8) {
      setPostalLookup('idle');
      return;
    }

    let active = true;
    const timer = window.setTimeout(() => {
      setPostalLookup('loading');
      void lookupPostalCode(digits)
        .then((address) => {
          if (!active) return;
          if (!address) {
            setPostalLookup('not-found');
            return;
          }
          setForm((current) => ({ ...current, street: address.street || current.street, district: address.district || current.district, city: address.city || current.city, state: address.state || current.state }));
          setPostalLookup('success');
        })
        .catch(() => {
          if (active) setPostalLookup('error');
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [form.postalCode]);
  function updateField(field: keyof AddressForm, value: string | boolean) { setForm((current) => ({ ...current, [field]: value })); }
  function startEdit(address: AccountAddress) { setEditingId(address.publicId); setMessage(''); setError(''); setForm({ label: address.label, recipientName: address.recipientName, street: address.street, number: address.number, complement: address.complement ?? '', district: address.district, city: address.city, state: address.state, postalCode: address.postalCode, isDefault: address.isDefault }); window.setTimeout(() => document.getElementById('account-address-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0); }
  function resetForm() { setEditingId(null); setForm(emptyForm); setError(''); }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(''); setMessage('');
    const payload = { ...form, label: form.label.trim(), recipientName: form.recipientName.trim(), street: form.street.trim(), number: form.number.trim(), complement: form.complement.trim() || undefined, district: form.district.trim(), city: form.city.trim(), state: form.state.trim().toUpperCase(), postalCode: form.postalCode };
    try {
      if (editingId) await accountApi.updateAddress(editingId, payload); else await accountApi.createAddress(payload);
      await loadAddresses();
      const wasEditing = Boolean(editingId);
      resetForm();
      setMessage(wasEditing ? 'Endereço atualizado.' : 'Endereço adicionado.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível salvar este endereço.'); }
    finally { setSaving(false); }
  }

  async function setDefault(address: AccountAddress) {
    setBusyId(address.publicId); setError('');
    try { const next = await accountApi.setDefaultAddress(address.publicId); setAddresses((current) => current.map((item) => ({ ...item, isDefault: item.publicId === next.publicId }))); setMessage('Endereço principal atualizado.'); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível atualizar o endereço principal.'); }
    finally { setBusyId(''); }
  }

  async function deleteAddress() {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.publicId); setError('');
    try { await accountApi.deleteAddress(deleteTarget.publicId); setAddresses((current) => current.filter((item) => item.publicId !== deleteTarget.publicId)); setMessage('Endereço excluído.'); setDeleteTarget(null); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível excluir este endereço.'); }
    finally { setBusyId(''); }
  }

  const focusAddressForm = () => document.getElementById('account-address-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return (
    <div className="account-page-content">
      <div className="account-content-heading">
        <div><p className="eyebrow">Onde receber</p><h2>Meus endereços</h2><p>Salve seus endereços para finalizar as compras com mais agilidade.</p></div>
        <button className="button button--primary" type="button" onClick={() => { resetForm(); focusAddressForm(); }}><Icon name="plus" size={16} strokeWidth={2} />Novo endereço</button>
      </div>
      {error && !loading ? <p className="form-error" role="alert">{error}</p> : null}
      {message ? <p className="form-success" role="status"><Icon name="check-circle-2" size={16} strokeWidth={1.9} />{message}</p> : null}
      {loading ? <div className="account-state account-state--inline" role="status"><span className="account-spinner" aria-hidden="true" />Carregando endereços…</div> : addresses.length ? <div className="account-address-grid">{addresses.map((address) => <AccountAddressCard key={address.publicId} address={address} onEdit={() => startEdit(address)} onDelete={() => setDeleteTarget(address)} onDefault={() => void setDefault(address)} busy={busyId === address.publicId || saving} />)}</div> : <AccountEmptyState icon="map-pin" title="Você ainda não tem endereços" description="Adicione um endereço de entrega para agilizar o checkout." action={<button className="button button--primary" type="button" onClick={focusAddressForm}>Adicionar primeiro endereço</button>} />}
      <form id="account-address-form" className="account-form account-panel" noValidate onSubmit={submit}>
        <div className="account-form__intro">
          <span className="account-panel-icon"><Icon name="map-pin" size={20} strokeWidth={1.8} /></span>
          <div><h3>{editingId ? 'Editar endereço' : 'Adicionar endereço'}</h3><p>Use um nome curto para encontrar este endereço no checkout.</p></div>
          {editingId ? <button className="account-text-button" type="button" onClick={resetForm}>Cancelar edição</button> : null}
        </div>
        <div className="account-form__grid account-form__grid--address">
          <label>Identificação<input value={form.label} onChange={(event) => updateField('label', event.target.value)} placeholder="Ex.: Casa ou Trabalho" required /></label>
          <label>Nome de quem recebe<input autoComplete="name" value={form.recipientName} onChange={(event) => updateField('recipientName', event.target.value)} required /></label>
          <label className="account-form__wide">Rua / avenida<input autoComplete="street-address" value={form.street} onChange={(event) => updateField('street', event.target.value)} required /></label>
          <label>Número<input value={form.number} onChange={(event) => updateField('number', event.target.value)} required /></label>
          <label>Complemento <span className="account-field-hint">opcional</span><input value={form.complement} onChange={(event) => updateField('complement', event.target.value)} /></label>
          <label>Bairro<input value={form.district} onChange={(event) => updateField('district', event.target.value)} required /></label>
          <label>Cidade<input autoComplete="address-level2" value={form.city} onChange={(event) => updateField('city', event.target.value)} required /></label>
          <label>UF<input maxLength={2} value={form.state} onChange={(event) => updateField('state', event.target.value.toUpperCase())} required /></label>
          <label>CEP<input autoComplete="postal-code" inputMode="numeric" value={form.postalCode} onChange={(event) => updateField('postalCode', formatPostalCode(event.target.value))} placeholder="68900-000" aria-describedby={postalLookup !== 'idle' ? 'account-postal-status' : undefined} required />{postalLookup !== 'idle' ? <span id="account-postal-status" className={`account-field-hint account-field-status account-field-status--${postalLookup}`} role="status" aria-live="polite">{postalLookup === 'loading' ? 'Consultando endereço…' : postalLookup === 'success' ? 'Endereço preenchido automaticamente.' : postalLookup === 'not-found' ? 'CEP não encontrado.' : 'Não foi possível consultar o CEP agora.'}</span> : null}</label>
        </div>
        <label className="account-checkbox"><input type="checkbox" checked={form.isDefault} onChange={(event) => updateField('isDefault', event.target.checked)} /><span>Definir como endereço principal</span></label>
        <div className="account-form__footer"><span>Seus dados são usados apenas para processar e entregar seus pedidos.</span><button className="button button--primary" type="submit" disabled={saving}>{saving ? 'Salvando…' : editingId ? 'Salvar endereço' : 'Adicionar endereço'}</button></div>
      </form>
      {deleteTarget ? <ConfirmDialog title="Excluir este endereço?" description={`O endereço “${deleteTarget.label}” será removido da sua conta.`} confirmLabel="Excluir endereço" onConfirm={() => void deleteAddress()} onClose={() => setDeleteTarget(null)} busy={busyId === deleteTarget.publicId} /> : null}
    </div>
  );
}
