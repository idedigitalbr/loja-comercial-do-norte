import { useEffect, useState, type FormEvent } from 'react';

type DiscountType = 'PERCENTAGE' | 'FIXED_CART' | 'FIXED_PRODUCT';
type CouponStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
type Coupon = {
  id: string;
  code: string;
  description?: string | null;
  status: CouponStatus | string;
  discountType: DiscountType;
  discountValue: number;
  allowFreeShipping: boolean;
  individualUse: boolean;
  excludeSaleItems: boolean;
  usageCount: number;
  usageLimit?: number | null;
  perCustomerLimit?: number | null;
  minimumSubtotalCents?: number | null;
  maximumSubtotalCents?: number | null;
  maxEligibleItems?: number | null;
  startsAt: string;
  endsAt?: string | null;
  productRules?: Array<{ productId: string; excluded: boolean }>;
  brandRules?: Array<{ brandId: string; excluded: boolean }>;
  categoryRules?: Array<{ categoryId: string; excluded: boolean }>;
  emailRestrictions?: Array<{ pattern: string }>;
};

type CouponForm = {
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: string;
  allowFreeShipping: boolean;
  individualUse: boolean;
  excludeSaleItems: boolean;
  startsAt: string;
  endsAt: string;
  status: CouponStatus;
  minimumSubtotal: string;
  maximumSubtotal: string;
  maxEligibleItems: string;
  usageLimit: string;
  perCustomerLimit: string;
  productIds: string;
  excludedProductIds: string;
  brandIds: string;
  excludedBrandIds: string;
  categoryIds: string;
  excludedCategoryIds: string;
  emailPatterns: string;
};

type FormTab = 'general' | 'restriction' | 'limits';

const blankForm: CouponForm = {
  code: '', description: '', discountType: 'FIXED_CART', discountValue: '', allowFreeShipping: false, individualUse: false, excludeSaleItems: false,
  startsAt: '', endsAt: '', status: 'ACTIVE', minimumSubtotal: '', maximumSubtotal: '', maxEligibleItems: '', usageLimit: '', perCustomerLimit: '',
  productIds: '', excludedProductIds: '', brandIds: '', excludedBrandIds: '', categoryIds: '', excludedCategoryIds: '', emailPatterns: '',
};

function parseMoney(value: string): number | undefined {
  const compact = value.replace(/\s/g, '');
  const normalized = compact.includes(',') ? compact.replace(/\./g, '').replace(',', '.') : compact;
  if (!normalized) return undefined;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed * 100)) : undefined;
}

function parseInteger(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 ? parsed : undefined;
}

function splitValues(value: string): string[] {
  return [...new Set(value.split(/[\n,;]+/).map((item) => item.trim()).filter(Boolean))];
}

function localDate(value?: string | null): string {
  return value ? new Date(value).toISOString().slice(0, 16) : '';
}

function money(cents?: number | null): string {
  return cents === null || cents === undefined ? '' : (cents / 100).toFixed(2).replace('.', ',');
}

function formFromCoupon(coupon: Coupon): CouponForm {
  return {
    code: coupon.code,
    description: coupon.description ?? '',
    discountType: coupon.discountType,
    discountValue: coupon.discountType === 'PERCENTAGE' ? String(coupon.discountValue) : money(coupon.discountValue),
    allowFreeShipping: coupon.allowFreeShipping,
    individualUse: coupon.individualUse,
    excludeSaleItems: coupon.excludeSaleItems,
    startsAt: localDate(coupon.startsAt),
    endsAt: localDate(coupon.endsAt),
    status: coupon.status as CouponStatus,
    minimumSubtotal: money(coupon.minimumSubtotalCents),
    maximumSubtotal: money(coupon.maximumSubtotalCents),
    maxEligibleItems: coupon.maxEligibleItems ? String(coupon.maxEligibleItems) : '',
    usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : '',
    perCustomerLimit: coupon.perCustomerLimit ? String(coupon.perCustomerLimit) : '',
    productIds: (coupon.productRules ?? []).filter((rule) => !rule.excluded).map((rule) => rule.productId).join(', '),
    excludedProductIds: (coupon.productRules ?? []).filter((rule) => rule.excluded).map((rule) => rule.productId).join(', '),
    brandIds: (coupon.brandRules ?? []).filter((rule) => !rule.excluded).map((rule) => rule.brandId).join(', '),
    excludedBrandIds: (coupon.brandRules ?? []).filter((rule) => rule.excluded).map((rule) => rule.brandId).join(', '),
    categoryIds: (coupon.categoryRules ?? []).filter((rule) => !rule.excluded).map((rule) => rule.categoryId).join(', '),
    excludedCategoryIds: (coupon.categoryRules ?? []).filter((rule) => rule.excluded).map((rule) => rule.categoryId).join(', '),
    emailPatterns: (coupon.emailRestrictions ?? []).map((rule) => rule.pattern).join(', '),
  };
}

function readableDiscount(coupon: Coupon): string {
  if (coupon.discountType === 'PERCENTAGE') return `${coupon.discountValue}%`;
  return `R$ ${(coupon.discountValue / 100).toFixed(2).replace('.', ',')}`;
}

async function responseError(response: Response, fallback: string): Promise<string> {
  try {
    const body = await response.json() as { message?: string | string[] };
    return Array.isArray(body.message) ? body.message.join(' ') : body.message || fallback;
  } catch {
    return fallback;
  }
}

export function PromotionsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState<CouponForm>(blankForm);
  const [activeTab, setActiveTab] = useState<FormTab>('general');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingId, setChangingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/admin/promotions/coupons', { credentials: 'include' });
      if (!response.ok) throw new Error(await responseError(response, 'Não foi possível carregar os cupons.'));
      setCoupons(await response.json() as Coupon[]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível carregar os cupons.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  function updateForm<K extends keyof CouponForm>(key: K, value: CouponForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm(clearFeedback = true) {
    setForm(blankForm);
    setEditingId(null);
    setActiveTab('general');
    if (clearFeedback) {
      setError('');
      setMessage('');
    }
  }

  function payloadFromForm() {
    const discountValue = form.discountType === 'PERCENTAGE'
      ? (form.discountValue.trim() ? Math.round(Number(form.discountValue.replace(',', '.'))) : 0)
      : (parseMoney(form.discountValue) ?? 0);
    return {
      code: form.code.trim().toUpperCase(),
      description: form.description.trim() || null,
      discountType: form.discountType,
      discountValue,
      allowFreeShipping: form.allowFreeShipping,
      individualUse: form.individualUse,
      excludeSaleItems: form.excludeSaleItems,
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : undefined,
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
      status: form.status,
      minimumSubtotalCents: parseMoney(form.minimumSubtotal) ?? null,
      maximumSubtotalCents: parseMoney(form.maximumSubtotal) ?? null,
      maxEligibleItems: parseInteger(form.maxEligibleItems) ?? null,
      usageLimit: parseInteger(form.usageLimit) ?? null,
      perCustomerLimit: parseInteger(form.perCustomerLimit) ?? null,
      productIds: splitValues(form.productIds),
      excludedProductIds: splitValues(form.excludedProductIds),
      brandIds: splitValues(form.brandIds),
      excludedBrandIds: splitValues(form.excludedBrandIds),
      categoryIds: splitValues(form.categoryIds),
      excludedCategoryIds: splitValues(form.excludedCategoryIds),
      emailPatterns: splitValues(form.emailPatterns),
    };
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.code.trim()) { setError('Informe o código do cupom.'); setActiveTab('general'); return; }
    if (form.discountType === 'PERCENTAGE' && (Number(form.discountValue.replace(',', '.')) > 100 || Number(form.discountValue.replace(',', '.')) < 0)) {
      setError('O percentual do desconto deve estar entre 0 e 100.'); setActiveTab('general'); return;
    }
    setSaving(true); setError(''); setMessage('');
    try {
      const response = await fetch(editingId ? `/api/v1/admin/promotions/coupons/${editingId}` : '/api/v1/admin/promotions/coupons', {
        method: editingId ? 'PATCH' : 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payloadFromForm()),
      });
      if (!response.ok) setError(await responseError(response, 'Não foi possível salvar o cupom.'));
      else { setMessage(editingId ? 'Cupom atualizado.' : form.status === 'ACTIVE' ? 'Cupom criado e ativo.' : 'Cupom criado.'); resetForm(false); await load(); }
    } catch {
      setError('Não foi possível salvar o cupom. Verifique a conexão e tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(coupon: Coupon) {
    const nextStatus = coupon.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setChangingId(coupon.id); setError('');
    try {
      const response = await fetch(`/api/v1/admin/promotions/coupons/${coupon.id}`, {
        method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: coupon.code, status: nextStatus }),
      });
      if (!response.ok) setError(await responseError(response, 'Não foi possível atualizar o status do cupom.'));
      else { setMessage(nextStatus === 'ACTIVE' ? 'Cupom ativado.' : 'Cupom desativado.'); await load(); }
    } catch {
      setError('Não foi possível atualizar o status do cupom. Verifique a conexão e tente novamente.');
    } finally {
      setChangingId(null);
    }
  }

  return (
    <section className="admin-page admin-promotions-page">
      <div className="admin-page__heading">
        <div><p className="admin-eyebrow">WooCommerce / marketing</p><h2>Promoções</h2></div>
        <p>Crie cupons com desconto, restrições de elegibilidade e limites de resgate para campanhas comerciais.</p>
      </div>
      {error ? <p className="admin-error" role="alert">{error}</p> : null}
      {message ? <p className="admin-success" role="status">{message}</p> : null}

      <div className="admin-card admin-editor">
        <div className="admin-editor__heading"><div><p className="admin-eyebrow">Cupom de desconto</p><h3>{editingId ? 'Editar cupom' : 'Novo cupom'}</h3></div><span className="admin-help">As regras são validadas novamente no checkout.</span></div>
        <div className="admin-tabbar" role="tablist" aria-label="Configuração do cupom">
          {([['general', 'Geral'], ['restriction', 'Restrição de uso'], ['limits', 'Limites de uso']] as Array<[FormTab, string]>).map(([id, label]) => <button key={id} role="tab" aria-selected={activeTab === id} className={activeTab === id ? 'is-active' : ''} type="button" onClick={() => setActiveTab(id)}>{label}</button>)}
        </div>

        <form className="admin-promotions-form" noValidate onSubmit={(event) => void submit(event)}>
          {activeTab === 'general' ? <div className="admin-form-grid admin-form-grid--two">
            <label>Código do cupom<input value={form.code} onChange={(event) => updateForm('code', event.target.value.toUpperCase())} placeholder="BEMVINDO10" autoComplete="off" required /></label>
            <label>Descrição interna<input value={form.description} onChange={(event) => updateForm('description', event.target.value)} placeholder="Campanha de boas-vindas" /></label>
            <label>Tipo de desconto<select value={form.discountType} onChange={(event) => updateForm('discountType', event.target.value as DiscountType)}><option value="PERCENTAGE">Desconto de porcentagem</option><option value="FIXED_CART">Desconto fixo de carrinho</option><option value="FIXED_PRODUCT">Desconto fixo de produto</option></select></label>
            <label>Valor do desconto<input aria-label="Valor do desconto" inputMode="decimal" value={form.discountValue} onChange={(event) => updateForm('discountValue', event.target.value)} placeholder={form.discountType === 'PERCENTAGE' ? '10' : '10,00'} required /><small className="admin-help">{form.discountType === 'PERCENTAGE' ? 'Informe um valor entre 0 e 100.' : 'Informe o valor em reais.'}</small></label>
            <label>Início da validade<input type="datetime-local" value={form.startsAt} onChange={(event) => updateForm('startsAt', event.target.value)} /></label>
            <label>Data de expiração<input type="datetime-local" value={form.endsAt} onChange={(event) => updateForm('endsAt', event.target.value)} /></label>
            <label>Status<select value={form.status} onChange={(event) => updateForm('status', event.target.value as CouponStatus)}><option value="ACTIVE">Ativo</option><option value="INACTIVE">Inativo</option><option value="EXPIRED">Expirado</option></select></label>
            <label className="admin-settings__switch-label"><span>Permitir frete grátis<small className="admin-help">Zera o frete selecionado quando elegível.</small></span><input type="checkbox" checked={form.allowFreeShipping} onChange={(event) => updateForm('allowFreeShipping', event.target.checked)} /></label>
          </div> : null}

          {activeTab === 'restriction' ? <div className="admin-promotions-tab-content">
            <div className="admin-form-grid admin-form-grid--two"><label>Gasto mínimo (R$)<input inputMode="decimal" value={form.minimumSubtotal} onChange={(event) => updateForm('minimumSubtotal', event.target.value)} placeholder="0,00" /></label><label>Gasto máximo (R$)<input inputMode="decimal" value={form.maximumSubtotal} onChange={(event) => updateForm('maximumSubtotal', event.target.value)} placeholder="Sem limite" /></label></div>
            <div className="admin-promotions-toggle-grid"><label className="admin-settings__switch-label"><span>Uso individual apenas<small className="admin-help">Impede a combinação com outros cupons.</small></span><input type="checkbox" checked={form.individualUse} onChange={(event) => updateForm('individualUse', event.target.checked)} /></label><label className="admin-settings__switch-label"><span>Excluir itens em promoção<small className="admin-help">Considera preço promocional do produto.</small></span><input type="checkbox" checked={form.excludeSaleItems} onChange={(event) => updateForm('excludeSaleItems', event.target.checked)} /></label></div>
            <div className="admin-editor__section"><div className="admin-section-title"><div><p className="admin-eyebrow">Elegibilidade por catálogo</p><h4>Produtos, marcas e categorias</h4></div><span className="admin-help">Separe IDs por vírgula. Deixe vazio para aceitar todo o catálogo.</span></div><div className="admin-form-grid admin-form-grid--two"><label>Produtos incluídos<textarea className="resize-none" rows={3} value={form.productIds} onChange={(event) => updateForm('productIds', event.target.value)} placeholder="ID do produto, outro ID" /></label><label>Produtos excluídos<textarea className="resize-none" rows={3} value={form.excludedProductIds} onChange={(event) => updateForm('excludedProductIds', event.target.value)} placeholder="ID do produto" /></label><label>Marcas incluídas<textarea className="resize-none" rows={3} value={form.brandIds} onChange={(event) => updateForm('brandIds', event.target.value)} placeholder="ID da marca" /></label><label>Marcas excluídas<textarea className="resize-none" rows={3} value={form.excludedBrandIds} onChange={(event) => updateForm('excludedBrandIds', event.target.value)} placeholder="ID da marca" /></label><label>Categorias incluídas<textarea className="resize-none" rows={3} value={form.categoryIds} onChange={(event) => updateForm('categoryIds', event.target.value)} placeholder="ID da categoria" /></label><label>Categorias excluídas<textarea className="resize-none" rows={3} value={form.excludedCategoryIds} onChange={(event) => updateForm('excludedCategoryIds', event.target.value)} placeholder="ID da categoria" /></label></div></div>
            <div className="admin-editor__section"><div className="admin-section-title"><div><p className="admin-eyebrow">Elegibilidade por cliente</p><h4>Restrições de e-mail</h4></div><span className="admin-help">Aceita curingas, por exemplo *@gmail.com.</span></div><label className="admin-form__full">Padrões de e-mail<textarea className="resize-none" rows={2} value={form.emailPatterns} onChange={(event) => updateForm('emailPatterns', event.target.value)} placeholder="cliente@empresa.com, *@gmail.com" /></label></div>
          </div> : null}

          {activeTab === 'limits' ? <div className="admin-promotions-tab-content"><div className="admin-form-grid admin-form-grid--three"><label>Limite de uso por cupom<input aria-label="Limite de uso por cupom" type="number" min="1" value={form.usageLimit} onChange={(event) => updateForm('usageLimit', event.target.value)} placeholder="Sem limite" /><small className="admin-help">Total global de resgates.</small></label><label>Limitar o uso a X itens<input aria-label="Limitar o uso a X itens" type="number" min="1" value={form.maxEligibleItems} onChange={(event) => updateForm('maxEligibleItems', event.target.value)} placeholder="Todos os itens" /><small className="admin-help">Quantidade máxima de unidades com desconto.</small></label><label>Limite por cliente<input aria-label="Limite por cliente" type="number" min="1" value={form.perCustomerLimit} onChange={(event) => updateForm('perCustomerLimit', event.target.value)} placeholder="Sem limite" /><small className="admin-help">Usa ID da conta ou e-mail de faturamento.</small></label></div></div> : null}

          <div className="admin-editor__footer"><button className="admin-button admin-button--outline admin-button--compact" type="button" onClick={() => resetForm()}>Limpar</button><button className="admin-button admin-button--compact" type="submit" disabled={saving}>{saving ? 'Salvando…' : editingId ? 'Salvar alterações' : 'Criar cupom'}</button></div>
        </form>
      </div>

      <div className="admin-card admin-table-card"><div className="admin-section-title admin-promotions-list-heading"><div><p className="admin-eyebrow">Códigos da loja</p><h3>{coupons.length} {coupons.length === 1 ? 'cupom' : 'cupons'}</h3></div><span className="admin-help">Editar regras sem perder os resgates já registrados.</span></div><div className="admin-table-wrap">{loading ? <p className="admin-empty">Carregando cupons…</p> : <table className="admin-table"><thead><tr><th>Código</th><th>Desconto</th><th>Status</th><th>Uso</th><th>Validade</th><th>Ações</th></tr></thead><tbody>{coupons.map((coupon) => <tr key={coupon.id}><td><strong>{coupon.code}</strong>{coupon.description ? <small className="admin-table__subline">{coupon.description}</small> : null}</td><td>{readableDiscount(coupon)}{coupon.allowFreeShipping ? <small className="admin-table__subline">Frete grátis</small> : null}</td><td><span className={`admin-status admin-status--${coupon.status.toLowerCase()}`}>{coupon.status}</span></td><td>{coupon.usageCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}</td><td>{new Date(coupon.startsAt).toLocaleDateString('pt-BR')} · {coupon.endsAt ? new Date(coupon.endsAt).toLocaleDateString('pt-BR') : 'Sem fim'}</td><td className="admin-table__actions"><button className="admin-link-button" type="button" onClick={() => { setForm(formFromCoupon(coupon)); setEditingId(coupon.id); setActiveTab('general'); setError(''); setMessage(''); }}>Editar</button>{coupon.status === 'ACTIVE' || coupon.status === 'INACTIVE' ? <button className="admin-link-button admin-link-button--danger" type="button" disabled={changingId === coupon.id} onClick={() => void changeStatus(coupon)}>{changingId === coupon.id ? 'Atualizando…' : coupon.status === 'ACTIVE' ? 'Desativar' : 'Ativar'}</button> : null}</td></tr>)}</tbody></table>}{!loading && !coupons.length ? <p className="admin-empty">Nenhum cupom cadastrado.</p> : null}</div></div>
    </section>
  );
}
