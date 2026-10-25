'use client';

import React, { useState } from 'react';
import { Check, Image as ImageIcon, Link as LinkIcon, Search, Upload, X } from 'lucide-react';

export const availableMediaLibrary = [
  {
    id: 'ml-intelbras',
    name: 'Semana Intelbras no seu ritmo (Verde ML)',
    category: 'Topo Mercado Livre',
    url: '/assets/Pagina/S1 TOPO HERO/topo-banners-ML/D_NQ_2X_977867-MLA118147004068_102026-OO.webp',
  },
  {
    id: 'ml-super-ofertas',
    name: 'Super Ofertas Comercial do Norte (Azul ML)',
    category: 'Topo Mercado Livre',
    url: '/assets/Pagina/S1 TOPO HERO/topo-banners-ML/D_NQ_2X_690577-MLA118270011000_102026-OO.webp',
  },
  {
    id: 'gemini-copo',
    name: 'Super Oferta Copo Cristalcopo',
    category: 'Campanhas',
    url: '/assets/S1-banners-topo-hero/Gemini_Generated_Image_x5pilwx5pilwx5pi.jpg',
  },
  {
    id: 'gemini-outlet',
    name: 'Mega Descontos e Outlet das Embalagens',
    category: 'Campanhas',
    url: '/assets/S1-banners-topo-hero/Gemini_Generated_Image_k46c0pk46c0pk46c.jpg',
  },
  {
    id: 'gemini-verao',
    name: 'Verão Total Ofertas Mais Quentes',
    category: 'Campanhas',
    url: '/assets/S1-banners-topo-hero/Gemini_Generated_Image_k93f3kk93f3kk93f.jpg',
  },
  {
    id: 'gemini-paratrigp',
    name: 'Pará Trigo Stand Pizzas e Panificação',
    category: 'Eventos',
    url: '/assets/S1-banners-topo-hero/Gemini_Generated_Image_m54tnlm54tnlm54t.jpg',
  },
  {
    id: 'gemini-faltam3dias',
    name: 'Faltam 3 Dias Ofertas Especiais',
    category: 'Campanhas',
    url: '/assets/S1-banners-topo-hero/Gemini_Generated_Image_nmv06jnmv06jnmv0.jpg',
  },
  {
    id: 'gemini-fachada',
    name: 'Fachada Comercial do Norte — Tudo para quem faz o melhor',
    category: 'Institucional',
    url: '/assets/S1-banners-topo-hero/Gemini_Generated_Image_u1xlqu1xlqu1xlqu.jpg',
  },
  {
    id: 'logo-branca',
    name: 'Logo Oficial Comercial do Norte Branca',
    category: 'Branding',
    url: '/assets/Logos/logo-comercial-do-norte-branca.png',
  },
  {
    id: 'mascote-james',
    name: 'Mascote 3D James Principal',
    category: 'Mascote',
    url: '/assets/imgs/Mascote-3D-James-em-pe/principais/1-james-3d-principal.png',
  },
];

interface ElementorMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string, altText?: string) => void;
  currentImageUrl?: string;
  title?: string;
}

export function ElementorMediaModal({
  isOpen,
  onClose,
  onSelectImage,
  currentImageUrl,
  title = 'Selecionar ou Enviar Imagem',
}: ElementorMediaModalProps) {
  const [activeTab, setActiveTab] = useState<'library' | 'url'>('library');
  const [selectedUrl, setSelectedUrl] = useState<string>(currentImageUrl || availableMediaLibrary[0]?.url || '');
  const [customUrl, setCustomUrl] = useState('');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredMedia = availableMediaLibrary.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase())
  );

  const selectedItem = availableMediaLibrary.find((m) => m.url === selectedUrl);

  const handleConfirm = () => {
    if (activeTab === 'url' && customUrl.trim()) {
      onSelectImage(customUrl.trim());
    } else if (selectedUrl) {
      onSelectImage(selectedUrl, selectedItem?.name);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="flex h-[88vh] w-full max-w-5xl flex-col rounded-xl border border-slate-700 bg-[#26292c] text-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal no estilo Elementor */}
        <div className="flex h-14 items-center justify-between border-b border-white/10 bg-[#1e2022] px-6 select-none">
          <div className="flex items-center gap-3">
            <span className="flex size-7 items-center justify-center rounded bg-[#8C1D40] text-xs font-black text-white">
              E
            </span>
            <h2 className="text-sm font-bold text-white">{title}</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              aria-label="Fechar"
              className="flex size-8 cursor-pointer items-center justify-center rounded text-white/60 hover:bg-white/10 hover:text-white"
              onClick={onClose}
              type="button"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Barra de Abas do Modal */}
        <div className="flex border-b border-white/10 bg-[#222426] px-6 text-xs font-semibold select-none">
          <button
            className={`flex items-center gap-2 border-b-2 py-3 px-4 cursor-pointer transition ${
              activeTab === 'library'
                ? 'border-[#8C1D40] text-white font-bold'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
            onClick={() => setActiveTab('library')}
            type="button"
          >
            <ImageIcon className="size-4" />
            <span>Biblioteca de Banners ({availableMediaLibrary.length})</span>
          </button>
          <button
            className={`flex items-center gap-2 border-b-2 py-3 px-4 cursor-pointer transition ${
              activeTab === 'url'
                ? 'border-[#8C1D40] text-white font-bold'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
            onClick={() => setActiveTab('url')}
            type="button"
          >
            <LinkIcon className="size-4" />
            <span>Inserir via URL Externa</span>
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="flex flex-1 overflow-hidden">
          {activeTab === 'library' ? (
            <>
              {/* Lado Esquerdo: Grid de Imagens */}
              <div className="flex flex-1 flex-col overflow-hidden p-6">
                {/* Campo de Busca */}
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-black/30 px-3 py-2 border border-white/10">
                  <Search className="size-4 text-white/40" />
                  <input
                    className="w-full bg-transparent text-xs text-white placeholder-white/40 outline-none"
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Filtrar por nome ou categoria..."
                    type="text"
                    value={search}
                  />
                  {search && (
                    <button
                      className="text-white/40 hover:text-white text-xs cursor-pointer"
                      onClick={() => setSearch('')}
                      type="button"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                {/* Grid de Banners com rolagem */}
                <div className="grid flex-1 grid-cols-2 gap-4 overflow-y-auto pr-2 sm:grid-cols-3 md:grid-cols-4">
                  {filteredMedia.map((m) => {
                    const isSelected = selectedUrl === m.url;
                    return (
                      <div
                        className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-lg border-2 transition ${
                          isSelected
                            ? 'border-[#8C1D40] ring-2 ring-[#8C1D40]/50 bg-black/40'
                            : 'border-white/10 hover:border-white/30 bg-black/20'
                        }`}
                        key={m.id}
                        onClick={() => setSelectedUrl(m.url)}
                        onDoubleClick={handleConfirm}
                      >
                        <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                          {/* eslint-disable-next-js/next/no-img-element */}
                          <img
                            alt={m.name}
                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                            src={m.url}
                          />
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-[#8C1D40] text-white shadow-md">
                              <Check className="size-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <div className="p-2">
                          <span className="block truncate text-[11px] font-semibold text-white/90">
                            {m.name}
                          </span>
                          <span className="text-[10px] text-white/50">{m.category}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lado Direito: Detalhes da Imagem Selecionada */}
              <div className="hidden w-72 flex-col border-l border-white/10 bg-[#1f2124] p-5 lg:flex">
                <span className="text-xs font-bold uppercase tracking-wider text-white/60 mb-3">
                  Detalhes do Anexo
                </span>

                {selectedItem ? (
                  <div className="flex flex-col gap-3">
                    <div className="aspect-video w-full overflow-hidden rounded-lg border border-white/15 bg-black/40">
                      {/* eslint-disable-next-js/next/no-img-element */}
                      <img
                        alt={selectedItem.name}
                        className="h-full w-full object-cover"
                        src={selectedItem.url}
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white break-words">
                        {selectedItem.name}
                      </div>
                      <div className="mt-1 text-[11px] text-white/50">
                        Categoria: {selectedItem.category}
                      </div>
                      <div className="mt-2 rounded bg-black/30 p-2 text-[10px] text-white/60 font-mono break-all">
                        {selectedItem.url}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-1 items-center justify-center text-center text-xs text-white/40">
                    Selecione uma imagem na grade para visualizar detalhes.
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Aba de Inserção por URL */
            <div className="flex flex-1 flex-col p-8">
              <label className="text-xs font-bold text-white mb-2">
                Insira o link direto da imagem (URL):
              </label>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-xs text-white placeholder-white/40 focus:border-[#8C1D40] outline-none"
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://exemplo.com/banner.jpg"
                  type="url"
                  value={customUrl}
                />
              </div>

              {customUrl && (
                <div className="mt-6 flex flex-col items-center">
                  <span className="text-xs text-white/60 mb-2">Pré-visualização:</span>
                  <div className="max-w-md overflow-hidden rounded-xl border border-white/20 bg-black/40">
                    {/* eslint-disable-next-js/next/no-img-element */}
                    <img
                      alt="Preview"
                      className="max-h-60 w-auto object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/placeholder-error.png';
                      }}
                      src={customUrl}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rodapé do Modal com Ações */}
        <div className="flex h-16 items-center justify-between border-t border-white/10 bg-[#1e2022] px-6 select-none">
          <div className="text-xs text-white/60">
            {selectedItem ? (
              <span>Selecionado: <strong className="text-white">{selectedItem.name}</strong></span>
            ) : customUrl ? (
              <span>URL Externa Informada</span>
            ) : (
              <span>Nenhuma imagem selecionada</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              className="rounded-lg px-4 py-2 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition cursor-pointer"
              onClick={onClose}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#8C1D40] px-5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-[#a6224c]"
              onClick={handleConfirm}
              type="button"
            >
              <Check className="size-4" />
              <span>Inserir Mídia</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
