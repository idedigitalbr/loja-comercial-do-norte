import { useEffect, useState, type FormEvent } from 'react';
import {
  getSettings,
  saveEmailSettings,
  saveNotificationPreference,
  savePaymentSettings,
  saveSite,
  saveTemplate,
  testEmail,
  testPayment,
  testTemplate,
  uploadMedia,
  type AdminSettingsSnapshot,
  type EmailSettingsInput,
  type EmailTemplateSettings,
  type NotificationSettings,
  type PaymentSettingsInput,
  type SiteSettingsInput,
  type UploadKind,
} from './settings-api';

type SettingsTab = 'site' | 'payments' | 'email' | 'templates';
type BusyAction = SettingsTab | 'upload-logo' | 'upload-favicon';

type SiteForm = {
  siteName: string;
  address: string;
  phone: string;
  whatsapp: string;
  instagramUrl: string;
  title: string;
  description: string;
  logoPath: string;
  faviconPath: string;
};

type PaymentForm = {
  environment: 'TEST' | 'PRODUCTION';
  publicKey: string;
  accessToken: string;
  webhookSecret: string;
  enabled: boolean;
  enablePix: boolean;
  enableCard: boolean;
};

type EmailForm = {
  host: string;
  port: string;
  username: string;
  password: string;
  security: 'NONE' | 'STARTTLS' | 'SSL_TLS';
  fromEmail: string;
  fromName: string;
  replyTo: string;
  enabled: boolean;
  testRecipient: string;
};

type TemplateForm = {
  subject: string;
  htmlBody: string;
  textBody: string;
  enabled: boolean;
};

const tabs: Array<{ id: SettingsTab; label: string }> = [
  { id: 'site', label: 'Identidade do site' },
  { id: 'payments', label: 'Mercado Pago' },
  { id: 'email', label: 'SMTP e notificações' },
  { id: 'templates', label: 'Templates de e-mail' },
];

const blankTemplate: TemplateForm = { subject: '', htmlBody: '', textBody: '', enabled: true };

function siteFormFromSnapshot(snapshot: AdminSettingsSnapshot): SiteForm {
  return {
    siteName: snapshot.site.siteName,
    address: snapshot.site.address ?? '',
    phone: snapshot.site.phone ?? '',
    whatsapp: snapshot.site.whatsapp ?? '',
    instagramUrl: snapshot.site.instagramUrl ?? '',
    title: snapshot.site.title ?? '',
    description: snapshot.site.description ?? '',
    logoPath: snapshot.site.logoPath ?? '',
    faviconPath: snapshot.site.faviconPath ?? '',
  };
}

function paymentFormFromSnapshot(snapshot: AdminSettingsSnapshot): PaymentForm {
  return {
    environment: snapshot.payments.environment,
    publicKey: snapshot.payments.publicKey ?? '',
    accessToken: '',
    webhookSecret: '',
    enabled: snapshot.payments.enabled,
    enablePix: snapshot.payments.enablePix,
    enableCard: snapshot.payments.enableCard,
  };
}

function emailFormFromSnapshot(snapshot: AdminSettingsSnapshot): EmailForm {
  return {
    host: snapshot.smtp.host ?? '',
    port: String(snapshot.smtp.port),
    username: snapshot.smtp.username ?? '',
    password: '',
    security: snapshot.smtp.security,
    fromEmail: snapshot.smtp.fromEmail ?? '',
    fromName: snapshot.smtp.fromName ?? '',
    replyTo: snapshot.smtp.replyTo ?? '',
    enabled: snapshot.smtp.enabled,
    testRecipient: '',
  };
}

function templateFormFromSnapshot(template?: EmailTemplateSettings): TemplateForm {
  return template
    ? { subject: template.subject, htmlBody: template.htmlBody, textBody: template.textBody, enabled: template.enabled }
    : blankTemplate;
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : 'Não foi possível concluir a solicitação.';
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('site');
  const [snapshot, setSnapshot] = useState<AdminSettingsSnapshot | null>(null);
  const [site, setSite] = useState<SiteForm | null>(null);
  const [payment, setPayment] = useState<PaymentForm | null>(null);
  const [email, setEmail] = useState<EmailForm | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [template, setTemplate] = useState<TemplateForm>(blankTemplate);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<BusyAction | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function applySnapshot(next: AdminSettingsSnapshot) {
    setSnapshot(next);
    setSite(siteFormFromSnapshot(next));
    setPayment(paymentFormFromSnapshot(next));
    setEmail(emailFormFromSnapshot(next));
    const firstTemplate = next.templates[0];
    setSelectedTemplateId(firstTemplate?.id ?? '');
    setTemplate(templateFormFromSnapshot(firstTemplate));
  }

  async function refreshSnapshot() {
    const next = await getSettings();
    applySnapshot(next);
    return next;
  }

  useEffect(() => {
    let mounted = true;
    void getSettings().then((next) => {
      if (!mounted) return;
      applySnapshot(next);
      setLoading(false);
    }).catch(() => {
      if (!mounted) return;
      setError('Não foi possível carregar as configurações.');
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  function beginAction(action: BusyAction) {
    setBusy(action);
    setError('');
    setSuccess('');
  }

  function finishAction(message: string) {
    setBusy(null);
    setSuccess(message);
  }

  function failAction(reason: unknown) {
    setBusy(null);
    setError(errorText(reason));
  }

  async function handleSiteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!site) return;
    beginAction('site');
    const input: SiteSettingsInput = {
      siteName: site.siteName.trim(),
      address: site.address.trim() || null,
      phone: site.phone.trim() || null,
      whatsapp: site.whatsapp.trim() || null,
      instagramUrl: site.instagramUrl.trim() || null,
      title: site.title.trim() || null,
      description: site.description.trim() || null,
    };
    try {
      await saveSite(input);
      await refreshSnapshot();
      finishAction('Identidade do site salva.');
    } catch (reason) {
      failAction(reason);
    }
  }

  async function handleUpload(kind: Extract<UploadKind, 'logo' | 'favicon'>, file: File) {
    const action: BusyAction = kind === 'logo' ? 'upload-logo' : 'upload-favicon';
    beginAction(action);
    try {
      const result = await uploadMedia(kind, file);
      if (kind === 'logo') {
        setSite((current) => current ? { ...current, logoPath: result.path } : current);
        setSnapshot((current) => current ? { ...current, site: { ...current.site, logoPath: result.path } } : current);
      } else if (kind === 'favicon') {
        setSite((current) => current ? { ...current, faviconPath: result.path } : current);
        setSnapshot((current) => current ? { ...current, site: { ...current.site, faviconPath: result.path } } : current);
      }
      finishAction('Imagem carregada e vinculada ao site.');
    } catch (reason) {
      failAction(reason);
    }
  }

  async function handlePaymentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!payment) return;
    beginAction('payments');
    const input: PaymentSettingsInput = {
      environment: payment.environment,
      publicKey: payment.publicKey.trim() || null,
      enabled: payment.enabled,
      enablePix: payment.enablePix,
      enableCard: payment.enableCard,
      ...(payment.accessToken.trim() ? { accessToken: payment.accessToken.trim() } : {}),
      ...(payment.webhookSecret.trim() ? { webhookSecret: payment.webhookSecret.trim() } : {}),
    };
    try {
      await savePaymentSettings(input);
      await refreshSnapshot();
      finishAction('Configuração do Mercado Pago salva.');
    } catch (reason) {
      failAction(reason);
    }
  }

  async function handlePaymentTest() {
    if (!payment) return;
    beginAction('payments');
    try {
      const result = await testPayment({
        environment: payment.environment,
        ...(payment.accessToken.trim() ? { accessToken: payment.accessToken.trim() } : {}),
      });
      if (!result.ok) throw new Error('Não foi possível validar as credenciais do Mercado Pago.');
      finishAction('Conexão validada' + (result.accountLabel ? ' para ' + result.accountLabel : '') + '.');
    } catch (reason) {
      failAction(reason);
    }
  }

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) return;
    beginAction('email');
    const input: EmailSettingsInput = {
      host: email.host.trim() || null,
      port: Number(email.port) || 587,
      username: email.username.trim() || null,
      security: email.security,
      fromEmail: email.fromEmail.trim() || null,
      fromName: email.fromName.trim() || null,
      replyTo: email.replyTo.trim() || null,
      enabled: email.enabled,
      ...(email.password.trim() ? { password: email.password.trim() } : {}),
    };
    try {
      await saveEmailSettings(input);
      await refreshSnapshot();
      finishAction('Configuração SMTP salva.');
    } catch (reason) {
      failAction(reason);
    }
  }

  async function handleEmailTest() {
    if (!email?.testRecipient.trim()) {
      setError('Informe um destinatário para o teste SMTP.');
      return;
    }
    beginAction('email');
    try {
      await testEmail(email.testRecipient.trim());
      finishAction('E-mail de teste enviado.');
    } catch (reason) {
      failAction(reason);
    }
  }

  async function handleNotificationToggle(preference: NotificationSettings) {
    beginAction('email');
    try {
      await saveNotificationPreference(preference.eventKey, { enabled: !preference.enabled });
      await refreshSnapshot();
      finishAction('Preferência de notificação atualizada.');
    } catch (reason) {
      failAction(reason);
    }
  }

  function selectTemplate(id: string) {
    const selected = snapshot?.templates.find((item) => item.id === id);
    setSelectedTemplateId(id);
    setTemplate(templateFormFromSnapshot(selected));
  }

  async function handleTemplateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const selected = snapshot?.templates.find((item) => item.id === selectedTemplateId);
    if (!selected) return;
    beginAction('templates');
    try {
      await saveTemplate(selected.key, selected.locale, template);
      const next = await refreshSnapshot();
      const refreshed = next.templates.find((item) => item.key === selected.key && item.locale === selected.locale);
      if (refreshed) {
        setSelectedTemplateId(refreshed.id);
        setTemplate(templateFormFromSnapshot(refreshed));
      }
      finishAction('Template salvo.');
    } catch (reason) {
      failAction(reason);
    }
  }

  async function handleTemplateTest() {
    const selected = snapshot?.templates.find((item) => item.id === selectedTemplateId);
    if (!selected) return;
    const recipient = window.prompt('Enviar teste para qual e-mail?')?.trim();
    if (!recipient) return;
    beginAction('templates');
    try {
      await testTemplate(selected.key, selected.locale, recipient);
      finishAction('Template de teste enviado.');
    } catch (reason) {
      failAction(reason);
    }
  }

  if (loading) {
    return <section className="admin-page"><div className="admin-empty-state admin-card"><p className="admin-eyebrow">Configurações</p><h3>Carregando configurações…</h3></div></section>;
  }

  if (!snapshot || !site || !payment || !email) {
    return <section className="admin-page"><div className="admin-empty-state admin-card"><p role="alert" className="admin-error">{error || 'Não foi possível carregar as configurações.'}</p></div></section>;
  }

  return (
    <section className="admin-page admin-settings">
      <div className="admin-page__heading">
        <div><p className="admin-eyebrow">Operação e canais digitais</p><h2>Configurações</h2></div>
        <p>Centralize a identidade do site, os banners da home, os pagamentos e as notificações transacionais.</p>
      </div>

      {error ? <p className="admin-error" role="alert">{error}</p> : null}
      {success ? <p className="admin-success" role="status">{success}</p> : null}

      <div className="admin-tabbar admin-settings__tabs" role="tablist" aria-label="Configurações">
        {tabs.map((tab) => (
          <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} className={activeTab === tab.id ? 'is-active' : ''} onClick={() => { setActiveTab(tab.id); setError(''); setSuccess(''); }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'site' ? (
        <div className="admin-settings__stack">
          <form className="admin-card admin-editor" onSubmit={(event) => void handleSiteSubmit(event)}>
            <div className="admin-editor__heading"><div><p className="admin-eyebrow">Identidade</p><h3>Dados públicos da loja</h3></div><span className="admin-help">Esses dados aparecem no cabeçalho, rodapé e SEO.</span></div>
            <div className="admin-form-grid">
              <label>Nome do site<input value={site.siteName} onChange={(event) => setSite({ ...site, siteName: event.target.value })} /></label>
              <label>Título da página<input value={site.title} onChange={(event) => setSite({ ...site, title: event.target.value })} /></label>
              <label>Telefone<input value={site.phone} onChange={(event) => setSite({ ...site, phone: event.target.value })} /></label>
              <label>WhatsApp<input value={site.whatsapp} onChange={(event) => setSite({ ...site, whatsapp: event.target.value })} /></label>
              <label>Instagram<input type="url" value={site.instagramUrl} onChange={(event) => setSite({ ...site, instagramUrl: event.target.value })} /></label>
              <label>Endereço<input value={site.address} onChange={(event) => setSite({ ...site, address: event.target.value })} /></label>
            </div>
            <label className="admin-form__full">Descrição do site<textarea rows={4} value={site.description} onChange={(event) => setSite({ ...site, description: event.target.value })} /></label>
            <div className="admin-editor__footer"><span>As credenciais ficam protegidas e não são exibidas neste formulário.</span><button className="admin-button admin-button--compact" disabled={busy === 'site'} type="submit">{busy === 'site' ? 'Salvando…' : 'Salvar identidade'}</button></div>
          </form>

          <div className="admin-settings__media-grid">
            <article className="admin-card admin-settings__media-card">
              <div className="admin-section-title"><div><p className="admin-eyebrow">Marca</p><h3>Logo</h3></div><span className="admin-help">JPG, PNG ou WEBP</span></div>
              <div className="admin-settings__media-preview">{site.logoPath ? <img src={site.logoPath} alt="Logo atual" /> : <span>Sem logo cadastrada</span>}</div>
              <label className="admin-settings__upload">Enviar logo<input aria-label="Enviar logo" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleUpload('logo', file); event.currentTarget.value = ''; }} /></label>
            </article>
            <article className="admin-card admin-settings__media-card">
              <div className="admin-section-title"><div><p className="admin-eyebrow">Navegador</p><h3>Favicon</h3></div><span className="admin-help">Recomendado: imagem quadrada</span></div>
              <div className="admin-settings__media-preview admin-settings__media-preview--square">{site.faviconPath ? <img src={site.faviconPath} alt="Favicon atual" /> : <span>Sem favicon cadastrada</span>}</div>
              <label className="admin-settings__upload">Enviar favicon<input aria-label="Enviar favicon" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleUpload('favicon', file); event.currentTarget.value = ''; }} /></label>
            </article>
          </div>

          <div className="admin-settings__summary-grid">
            <article className="admin-card admin-settings__summary"><span>Mercado Pago</span><strong>{snapshot.payments.hasAccessToken ? 'Token configurado' : 'Token pendente'}</strong><small>{snapshot.payments.enabled ? 'Integração habilitada' : 'Integração desabilitada'}</small></article>
            <article className="admin-card admin-settings__summary"><span>SMTP</span><strong>{snapshot.smtp.hasPassword ? 'SMTP configurado' : 'SMTP pendente'}</strong><small>{snapshot.smtp.enabled ? 'Notificações habilitadas' : 'Notificações desabilitadas'}</small></article>
            <article className="admin-card admin-settings__summary"><span>Banners ativos</span><strong>{snapshot.banners.filter((item) => item.status === 'ACTIVE').length}</strong><small>Imagens publicadas na home</small></article>
          </div>
        </div>
      ) : null}

      {activeTab === 'payments' ? <PaymentPanel payment={payment} setPayment={setPayment} busy={busy} onSubmit={handlePaymentSubmit} onTest={() => void handlePaymentTest()} configured={snapshot.payments} /> : null}
      {activeTab === 'email' ? <div className="admin-settings__stack"><EmailPanel email={email} setEmail={setEmail} busy={busy} onSubmit={handleEmailSubmit} onTest={() => void handleEmailTest()} configured={snapshot.smtp} /><NotificationPreferences notifications={snapshot.notifications} busy={busy} onToggle={(preference) => void handleNotificationToggle(preference)} /></div> : null}
      {activeTab === 'templates' ? <TemplatePanel snapshot={snapshot} selectedTemplateId={selectedTemplateId} template={template} setTemplate={setTemplate} onSelect={selectTemplate} busy={busy} onSubmit={handleTemplateSubmit} onTest={() => void handleTemplateTest()} /> : null}
    </section>
  );
}

function PaymentPanel({ payment, setPayment, busy, onSubmit, onTest, configured }: { payment: PaymentForm; setPayment: (value: PaymentForm) => void; busy: BusyAction | null; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onTest: () => void; configured: AdminSettingsSnapshot['payments'] }) {
  return <form className="admin-card admin-editor" onSubmit={onSubmit}><div className="admin-editor__heading"><div><p className="admin-eyebrow">Checkout</p><h3>Mercado Pago</h3></div><span className="admin-settings__secure-state">{configured.hasAccessToken ? 'Token configurado' : 'Token pendente'} · {configured.hasWebhookSecret ? 'Webhook configurado' : 'Webhook pendente'}</span></div><p className="admin-help">O token de acesso e o segredo do webhook são criptografados no servidor e nunca retornam para o navegador.</p><div className="admin-form-grid admin-form-grid--three"><label>Ambiente<select value={payment.environment} onChange={(event) => setPayment({ ...payment, environment: event.target.value as PaymentForm['environment'] })}><option value="TEST">Teste</option><option value="PRODUCTION">Produção</option></select></label><label>Chave pública<input value={payment.publicKey} onChange={(event) => setPayment({ ...payment, publicKey: event.target.value })} placeholder="APP_USR-…" /></label><label className="admin-settings__switch-label">Integração habilitada<input type="checkbox" checked={payment.enabled} onChange={(event) => setPayment({ ...payment, enabled: event.target.checked })} /></label></div><div className="admin-form-grid admin-form-grid--two"><label>Token de acesso<input type="password" autoComplete="new-password" value={payment.accessToken} onChange={(event) => setPayment({ ...payment, accessToken: event.target.value })} placeholder={configured.hasAccessToken ? '•••••••• (já configurado)' : 'Cole o token de acesso'} /></label><label>Segredo do webhook<input type="password" autoComplete="new-password" value={payment.webhookSecret} onChange={(event) => setPayment({ ...payment, webhookSecret: event.target.value })} placeholder={configured.hasWebhookSecret ? '•••••••• (já configurado)' : 'Cole o segredo do webhook'} /></label></div><fieldset className="admin-check-group"><legend>Meios disponíveis no checkout</legend><div className="admin-check-grid"><label><input type="checkbox" checked={payment.enablePix} onChange={(event) => setPayment({ ...payment, enablePix: event.target.checked })} /> Pix</label><label><input type="checkbox" checked={payment.enableCard} onChange={(event) => setPayment({ ...payment, enableCard: event.target.checked })} /> Cartão</label></div></fieldset><div className="admin-editor__footer"><button className="admin-button admin-button--quiet admin-button--compact" type="button" disabled={busy === 'payments'} onClick={onTest}>Testar conexão</button><button className="admin-button admin-button--compact" disabled={busy === 'payments'} type="submit">{busy === 'payments' ? 'Processando…' : 'Salvar Mercado Pago'}</button></div></form>;
}

function EmailPanel({ email, setEmail, busy, onSubmit, onTest, configured }: { email: EmailForm; setEmail: (value: EmailForm) => void; busy: BusyAction | null; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onTest: () => void; configured: AdminSettingsSnapshot['smtp'] }) {
  return <form className="admin-card admin-editor" onSubmit={onSubmit}><div className="admin-editor__heading"><div><p className="admin-eyebrow">Comunicação</p><h3>SMTP e notificações</h3></div><span className="admin-settings__secure-state">{configured.hasPassword ? 'Senha configurada' : 'Senha pendente'}</span></div><p className="admin-help">O sistema envia cadastro, confirmação de pedido, pagamento e alterações de status usando os templates configurados.</p><div className="admin-form-grid admin-form-grid--three"><label>Host SMTP<input value={email.host} onChange={(event) => setEmail({ ...email, host: event.target.value })} placeholder="smtp.exemplo.com" /></label><label>Porta<input type="number" min="1" max="65535" value={email.port} onChange={(event) => setEmail({ ...email, port: event.target.value })} /></label><label>Segurança<select value={email.security} onChange={(event) => setEmail({ ...email, security: event.target.value as EmailForm['security'] })}><option value="NONE">Sem criptografia</option><option value="STARTTLS">STARTTLS</option><option value="SSL_TLS">SSL/TLS</option></select></label></div><div className="admin-form-grid admin-form-grid--two"><label>Usuário<input value={email.username} onChange={(event) => setEmail({ ...email, username: event.target.value })} /></label><label>Senha<input type="password" autoComplete="new-password" value={email.password} onChange={(event) => setEmail({ ...email, password: event.target.value })} placeholder={configured.hasPassword ? '•••••••• (já configurada)' : 'Senha SMTP'} /></label><label>E-mail remetente<input type="email" value={email.fromEmail} onChange={(event) => setEmail({ ...email, fromEmail: event.target.value })} /></label><label>Nome do remetente<input value={email.fromName} onChange={(event) => setEmail({ ...email, fromName: event.target.value })} /></label><label>Responder para<input type="email" value={email.replyTo} onChange={(event) => setEmail({ ...email, replyTo: event.target.value })} /></label><label className="admin-settings__switch-label">Notificações habilitadas<input type="checkbox" checked={email.enabled} onChange={(event) => setEmail({ ...email, enabled: event.target.checked })} /></label></div><div className="admin-settings__test-row"><label>E-mail para teste<input type="email" value={email.testRecipient} onChange={(event) => setEmail({ ...email, testRecipient: event.target.value })} placeholder="seu-email@exemplo.com" /></label><button className="admin-button admin-button--quiet admin-button--compact" type="button" disabled={busy === 'email'} onClick={onTest}>Enviar teste</button></div><div className="admin-editor__footer"><span>Deixe a senha em branco para manter a atual.</span><button className="admin-button admin-button--compact" disabled={busy === 'email'} type="submit">{busy === 'email' ? 'Salvando…' : 'Salvar SMTP'}</button></div></form>;
}

function NotificationPreferences({ notifications, busy, onToggle }: { notifications: NotificationSettings[]; busy: BusyAction | null; onToggle: (preference: NotificationSettings) => void }) {
  const labels: Record<string, string> = {
    ACCOUNT_CREATED: 'Cadastro de cliente',
    PASSWORD_RESET: 'Redefinição de senha',
    ORDER_CREATED: 'Pedido criado',
    ORDER_STATUS_CHANGED: 'Status do pedido alterado',
    PAYMENT_PENDING: 'Pagamento pendente',
    PAYMENT_APPROVED: 'Pagamento aprovado',
    PAYMENT_REJECTED: 'Pagamento recusado',
  };
  return <section className="admin-card admin-editor"><div className="admin-section-title"><div><p className="admin-eyebrow">Automação</p><h3>Eventos de notificação</h3></div><span className="admin-help">Controle quais mensagens transacionais ficam ativas.</span></div>{notifications.length ? <div className="admin-settings__notification-list">{notifications.map((preference) => <label className="admin-settings__notification" key={preference.id}><span><strong>{labels[preference.eventKey] ?? preference.eventKey}</strong><small>{preference.eventKey}</small></span><input type="checkbox" checked={preference.enabled} disabled={busy === 'email'} onChange={() => onToggle(preference)} /></label>)}</div> : <p className="admin-help">Nenhuma preferência cadastrada. Execute a carga inicial para habilitar os eventos padrão.</p>}</section>;
}

const TEMPLATE_PREVIEW_VARIABLES: Record<string, string> = {
  '{{customerName}}': 'Ana Cliente',
  '{{orderId}}': 'JE-2026-0001',
  '{{orderPublicId}}': 'JE-2026-0001',
  '{{paymentStatus}}': 'approved',
  '{{status}}': 'AWAITING_PAYMENT',
  '{{total}}': 'R$ 296,00',
  '{{totalCents}}': '29600',
  '{{orderUrl}}': 'http://localhost:5173/pedido/JE-2026-0001',
};

function templatePreview(source: string): string {
  return Object.entries(TEMPLATE_PREVIEW_VARIABLES).reduce((result, [variable, value]) => result.replaceAll(variable, value), source);
}

function TemplatePanel({ snapshot, selectedTemplateId, template, setTemplate, onSelect, busy, onSubmit, onTest }: { snapshot: AdminSettingsSnapshot; selectedTemplateId: string; template: TemplateForm; setTemplate: (value: TemplateForm) => void; onSelect: (id: string) => void; busy: BusyAction | null; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onTest: () => void }) {
  const selected = snapshot.templates.find((item) => item.id === selectedTemplateId);
  if (!snapshot.templates.length) return <div className="admin-card admin-empty-state"><p className="admin-eyebrow">Templates</p><h3>Nenhum template cadastrado</h3><p>Execute a carga inicial do banco para criar os templates transacionais.</p></div>;
  return <form className="admin-settings__template-layout" onSubmit={onSubmit}><aside className="admin-card admin-settings__template-list"><div className="admin-section-title"><div><p className="admin-eyebrow">Biblioteca</p><h3>Eventos</h3></div></div>{snapshot.templates.map((item) => <button className={item.id === selectedTemplateId ? 'is-active' : ''} type="button" key={item.id} onClick={() => onSelect(item.id)}><strong>{item.key}</strong><small>{item.locale} · {item.enabled ? 'ativo' : 'desativado'}</small></button>)}</aside><div className="admin-card admin-editor"><div className="admin-editor__heading"><div><p className="admin-eyebrow">{selected?.locale ?? '—'}</p><h3>{selected?.key ?? 'Template'}</h3></div><button className="admin-button admin-button--quiet admin-button--compact" type="button" disabled={!selected || busy === 'templates'} onClick={onTest}>Enviar teste</button></div><div className="admin-form"><label>Assunto<input value={template.subject} onChange={(event) => setTemplate({ ...template, subject: event.target.value })} /></label><label>Corpo HTML<textarea rows={10} value={template.htmlBody} onChange={(event) => setTemplate({ ...template, htmlBody: event.target.value })} /></label><label>Corpo texto<textarea rows={8} value={template.textBody} onChange={(event) => setTemplate({ ...template, textBody: event.target.value })} /></label><label className="admin-settings__switch-label">Template habilitado<input type="checkbox" checked={template.enabled} onChange={(event) => setTemplate({ ...template, enabled: event.target.checked })} /></label></div><div className="admin-settings__template-preview"><div className="admin-section-title"><div><p className="admin-eyebrow">Visualização</p><h4>Prévia do e-mail</h4></div><span className="admin-help">Exemplo com dados fictícios</span></div><iframe title="Pré-visualização do template" sandbox="" srcDoc={templatePreview(template.htmlBody)} /></div><div className="admin-editor__footer"><span>Variáveis permitidas são validadas antes do envio.</span><button className="admin-button admin-button--compact" disabled={busy === 'templates' || !selected} type="submit">{busy === 'templates' ? 'Salvando…' : 'Salvar template'}</button></div></div></form>;
}
