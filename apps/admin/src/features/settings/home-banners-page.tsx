import { useEffect, useState, type FormEvent } from 'react';
import {
  deleteBanner,
  getSettings,
  saveBanner,
  uploadMedia,
  type AdminSettingsSnapshot,
  type BannerInput,
  type BannerSettings,
} from './settings-api';

type BannerForm = {
  desktopPath: string;
  mobilePath: string;
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  sortOrder: string;
  status: BannerSettings['status'];
};

type BusyAction = 'banners' | 'upload-banner';

const blankBanner: BannerForm = {
  desktopPath: '',
  mobilePath: '',
  eyebrow: '',
  title: '',
  description: '',
  ctaLabel: '',
  ctaHref: '',
  sortOrder: '0',
  status: 'DRAFT',
};

function bannerFormFromSnapshot(banner: BannerSettings): BannerForm {
  return {
    desktopPath: banner.desktopPath,
    mobilePath: banner.mobilePath ?? '',
    eyebrow: banner.eyebrow ?? '',
    title: banner.title ?? '',
    description: banner.description ?? '',
    ctaLabel: banner.ctaLabel ?? '',
    ctaHref: banner.ctaHref ?? '',
    sortOrder: String(banner.sortOrder),
    status: banner.status,
  };
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : 'Não foi possível concluir a solicitação.';
}

function statusLabel(status: BannerSettings['status']): string {
  return status === 'ACTIVE' ? 'Ativo' : status === 'ARCHIVED' ? 'Arquivado' : 'Rascunho';
}

export function HomeBannersPage() {
  const [snapshot, setSnapshot] = useState<AdminSettingsSnapshot | null>(null);
  const [banner, setBanner] = useState<BannerForm>(blankBanner);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<BusyAction | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function refreshSnapshot() {
    const next = await getSettings();
    setSnapshot(next);
    return next;
  }

  useEffect(() => {
    let mounted = true;
    void getSettings().then((next) => {
      if (!mounted) return;
      setSnapshot(next);
      setLoading(false);
    }).catch((reason) => {
      if (!mounted) return;
      setError(errorText(reason));
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

  async function handleUpload(file: File | undefined, target: 'desktop' | 'mobile') {
    if (!file) return;
    beginAction('upload-banner');
    try {
      const result = await uploadMedia('banner', file);
      setBanner((current) => ({ ...current, [`${target}Path`]: result.path }));
      finishAction(target === 'desktop' ? 'Imagem desktop carregada.' : 'Imagem mobile carregada.');
    } catch (reason) {
      failAction(reason);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!banner.desktopPath) {
      setError('Envie a imagem desktop do banner antes de salvar.');
      return;
    }
    beginAction('banners');
    const input: BannerInput = {
      desktopPath: banner.desktopPath,
      mobilePath: banner.mobilePath || null,
      eyebrow: banner.eyebrow.trim() || null,
      title: banner.title.trim() || null,
      description: banner.description.trim() || null,
      ctaLabel: banner.ctaLabel.trim() || null,
      ctaHref: banner.ctaHref.trim() || null,
      sortOrder: Number(banner.sortOrder) || 0,
      status: banner.status,
    };
    try {
      await saveBanner(input, editingBannerId ?? undefined);
      await refreshSnapshot();
      setBanner(blankBanner);
      setEditingBannerId(null);
      finishAction('Banner salvo.');
    } catch (reason) {
      failAction(reason);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Excluir este banner? O arquivo de mídia permanecerá no armazenamento.')) return;
    beginAction('banners');
    try {
      await deleteBanner(id);
      await refreshSnapshot();
      if (editingBannerId === id) {
        setBanner(blankBanner);
        setEditingBannerId(null);
      }
      finishAction('Banner removido da lista.');
    } catch (reason) {
      failAction(reason);
    }
  }

  async function activateBanner(item: BannerSettings) {
    beginAction('banners');
    try {
      await saveBanner({ ...bannerFormFromSnapshot(item), mobilePath: item.mobilePath, sortOrder: item.sortOrder, status: 'ACTIVE' }, item.id);
      await refreshSnapshot();
      finishAction('Banner ativado.');
    } catch (reason) {
      failAction(reason);
    }
  }

  if (loading) {
    return <section className="admin-page"><div className="admin-empty-state admin-card"><p className="admin-eyebrow">Home institucional</p><h3>Carregando banners…</h3></div></section>;
  }

  if (!snapshot) {
    return <section className="admin-page"><div className="admin-empty-state admin-card"><p role="alert" className="admin-error">{error || 'Não foi possível carregar os banners da Home.'}</p></div></section>;
  }

  return (
    <section className="admin-page admin-settings">
      <div className="admin-page__heading">
        <div><p className="admin-eyebrow">Home institucional</p><h2>Banners da Home</h2></div>
        <p>Gerencie as imagens, textos, chamadas e o vídeo exibidos na abertura do site.</p>
      </div>

      {error ? <p className="admin-error" role="alert">{error}</p> : null}
      {success ? <p className="admin-success" role="status">{success}</p> : null}

      <div className="admin-settings__stack">
        <form className="admin-card admin-editor" noValidate onSubmit={(event) => void handleSubmit(event)}>
          <div className="admin-editor__heading"><div><p className="admin-eyebrow">Conteúdo do slide</p><h3>{editingBannerId ? 'Editar banner' : 'Novo banner'}</h3></div><span className="admin-help">A imagem desktop é obrigatória. A versão mobile é opcional.</span></div>
          <div className="admin-settings__upload-grid">
            <label className="admin-settings__upload admin-settings__upload--large">Enviar imagem desktop<input aria-label="Enviar imagem desktop" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; void handleUpload(file, 'desktop'); event.currentTarget.value = ''; }} /><small>{banner.desktopPath ? 'Imagem carregada' : 'Selecione uma imagem para o banner'}</small></label>
            <label className="admin-settings__upload admin-settings__upload--large">Enviar imagem mobile (opcional)<input aria-label="Enviar imagem mobile (opcional)" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; void handleUpload(file, 'mobile'); event.currentTarget.value = ''; }} /><small>{banner.mobilePath ? 'Imagem carregada' : 'Usará a imagem desktop'}</small></label>
          </div>
          <div className="admin-form-grid admin-form-grid--three">
            <label>Etiqueta<input value={banner.eyebrow} onChange={(event) => setBanner({ ...banner, eyebrow: event.target.value })} placeholder="Ex.: Jonas & Elivaldo" /></label>
            <label>Título<input value={banner.title} onChange={(event) => setBanner({ ...banner, title: event.target.value })} placeholder="Título do banner" /></label>
            <label>Ordem<input type="number" min="0" value={banner.sortOrder} onChange={(event) => setBanner({ ...banner, sortOrder: event.target.value })} /></label>
          </div>
          <label className="admin-form__full">Descrição<textarea className="admin-settings__banner-description resize-none" rows={3} value={banner.description} onChange={(event) => setBanner({ ...banner, description: event.target.value })} /></label>
          <div className="admin-form-grid admin-form-grid--three">
            <label>Texto do botão<input value={banner.ctaLabel} onChange={(event) => setBanner({ ...banner, ctaLabel: event.target.value })} placeholder="ASSISTA NOSSO VÍDEO" /></label>
            <label>Link do botão / vídeo YouTube<input type="text" value={banner.ctaHref} onChange={(event) => setBanner({ ...banner, ctaHref: event.target.value })} placeholder="https://youtube.com/watch?v=…" /><small className="admin-help">Links do YouTube abrem em modal na Home.</small></label>
            <label>Status<select value={banner.status} onChange={(event) => setBanner({ ...banner, status: event.target.value as BannerSettings['status'] })}><option value="DRAFT">Rascunho</option><option value="ACTIVE">Ativo</option><option value="ARCHIVED">Arquivado</option></select></label>
          </div>
          <div className="admin-editor__footer"><button className="admin-button admin-button--quiet admin-button--compact" type="button" onClick={() => { setBanner(blankBanner); setEditingBannerId(null); }}>Limpar</button><button className="admin-button admin-button--compact" disabled={busy === 'banners' || busy === 'upload-banner'} type="submit">{busy === 'banners' ? 'Salvando…' : editingBannerId ? 'Atualizar banner' : 'Salvar banner'}</button></div>
        </form>

        <div className="admin-card admin-settings__banner-list">
          <div className="admin-section-title"><div><p className="admin-eyebrow">Conteúdo publicado</p><h3>{snapshot.banners.length} banners cadastrados</h3></div></div>
          {snapshot.banners.length ? <div className="admin-settings__banner-items">{snapshot.banners.map((item) => <article className="admin-settings__banner-item" key={item.id}><div className="admin-settings__banner-thumb">{item.desktopPath ? <img src={item.desktopPath} alt={item.title ?? 'Banner da home'} /> : <span>Sem imagem</span>}<span className="admin-status">{statusLabel(item.status)}</span></div><div className="admin-settings__banner-copy"><strong>{item.title || 'Banner sem título'}</strong><small>{item.eyebrow || 'Sem etiqueta'} · ordem {item.sortOrder}</small><div className="admin-settings__item-actions"><button className="admin-link-button" type="button" onClick={() => { setBanner(bannerFormFromSnapshot(item)); setEditingBannerId(item.id); }}>Editar</button>{item.status !== 'ACTIVE' ? <button className="admin-link-button" type="button" onClick={() => void activateBanner(item)}>Ativar</button> : null}<button className="admin-link-button admin-link-button--danger" type="button" onClick={() => void handleDelete(item.id)}>Excluir</button></div></div></article>)}</div> : <div className="admin-empty-state"><h3>Nenhum banner cadastrado</h3><p>Envie a primeira imagem para publicar a experiência visual da home.</p></div>}
        </div>
      </div>
    </section>
  );
}
