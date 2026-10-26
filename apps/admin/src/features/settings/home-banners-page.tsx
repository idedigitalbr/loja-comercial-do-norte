import { Icon } from '@commerce/ui';
import { getStorefrontEditorUrl } from '../../admin-shell';

export function HomeBannersPage() {
  const editorUrl = getStorefrontEditorUrl();

  return (
    <section className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="admin-eyebrow">Vitrine Modular &amp; Customização</p>
          <h2>Editar Páginas e Banners</h2>
        </div>
        <p>
          Edite visualmente qualquer banner, carrossel e seção diretamente na loja com pré-visualização em tempo real.
        </p>
      </div>

      <div className="admin-card" style={{ maxWidth: '860px', padding: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: '#004CB1',
              color: '#FFFFFF',
              boxShadow: '0 8px 16px rgba(0, 76, 177, 0.25)',
              flexShrink: 0,
            }}
          >
            <Icon name="image" size={28} />
          </div>
          <div>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: '6px',
                background: '#E0EAFF',
                color: '#1E40AF',
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '6px',
              }}
            >
              Novo Editor Visual 2026
            </span>
            <h3 style={{ margin: 0, fontSize: '22px', color: '#1D2433' }}>
              Edição Direta na Vitrine da Comercial do Norte
            </h3>
          </div>
        </div>

        <p style={{ color: '#475467', fontSize: '15px', lineHeight: 1.6, margin: '0 0 28px' }}>
          Os banners e blocos da loja agora são 100% visuais. Ao clicar no botão abaixo, a loja abrirá em uma nova
          guia já com o <strong>Modo Edição ativado</strong>, permitindo alterar imagens, títulos, links e a ordem das seções com 1 clique.
        </p>

        <div style={{ marginBottom: '32px' }}>
          <a
            href={editorUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '16px 32px',
              background: '#004CB1',
              color: '#FFFFFF',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '15px',
              textDecoration: 'none',
              boxShadow: '0 6px 18px rgba(0, 76, 177, 0.35)',
              transition: 'all 150ms ease',
            }}
          >
            <span>Abrir Editor Visual da Vitrine</span>
            <Icon name="arrow-up-right" size={18} />
          </a>
        </div>

        <hr style={{ border: 0, borderTop: '1px solid #E2E8F0', margin: '28px 0' }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <strong style={{ display: 'block', fontSize: '13px', color: '#0F172A', marginBottom: '6px' }}>
              🎨 Edição In-Place
            </strong>
            <small style={{ color: '#64748B', lineHeight: 1.4, display: 'block' }}>
              Passe o mouse por cima de qualquer banner ou card na loja para trocar a imagem ou link.
            </small>
          </div>

          <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <strong style={{ display: 'block', fontSize: '13px', color: '#0F172A', marginBottom: '6px' }}>
              📱 Responsivo (Desktop / Mobile)
            </strong>
            <small style={{ color: '#64748B', lineHeight: 1.4, display: 'block' }}>
              Alterne instantaneamente a visualização no topo entre computador, tablet e celular.
            </small>
          </div>

          <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <strong style={{ display: 'block', fontSize: '13px', color: '#0F172A', marginBottom: '6px' }}>
              ⠿ Reordenação Livre
            </strong>
            <small style={{ color: '#64748B', lineHeight: 1.4, display: 'block' }}>
              Suba ou desça qualquer uma das 20 seções da homepage como desejar.
            </small>
          </div>
        </div>
      </div>
    </section>
  );
}
