'use client';

import React, { useRef, useState } from 'react';
import {
  Check,
  FolderOpen,
  Image as ImageIcon,
  Link as LinkIcon,
  Search,
  Upload,
  UploadCloud,
  X,
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'library' | 'upload' | 'url'>('library');
  const [selectedUrl, setSelectedUrl] = useState<string>(currentImageUrl || availableMediaLibrary[0]?.url || '');
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [customUrl, setCustomUrl] = useState('');
  const [search, setSearch] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const filteredMedia = availableMediaLibrary.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase())
  );

  const selectedItem = availableMediaLibrary.find((m) => m.url === selectedUrl);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setUploadedPreview(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    if (activeTab === 'upload' && uploadedPreview) {
      onSelectImage(uploadedPreview, 'Imagem Carregada');
    } else if (activeTab === 'url' && customUrl.trim()) {
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
        className="flex h-[88vh] w-full max-w-5xl flex-col rounded-2xl border border-slate-700 bg-[#1e2022] text-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input invisível para upload */}
        <input
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          ref={fileRef}
          type="file"
        />

        {/* Cabeçalho do Modal no estilo Elementor */}
        <div className="flex h-14 items-center justify-between border-b border-white/10 bg-[#161719] px-6 select-none">
          <div className="flex items-center gap-3">
            <span className="flex size-7 items-center justify-center rounded-lg bg-[#004CB1] text-xs font-black text-white">
              E
            </span>
            <h2 className="text-sm font-bold text-white">{title}</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              aria-label="Fechar"
              className="flex size-8 cursor-pointer items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
              onClick={onClose}
              type="button"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Barra de 3 Abas do Modal */}
        <div className="flex border-b border-white/10 bg-[#222426] px-6 text-xs font-semibold select-none">
          {/* Aba 1: Biblioteca */}
          <button
            className={`flex items-center gap-2 border-b-2 py-3 px-4 cursor-pointer transition ${
              activeTab === 'library'
                ? 'border-[#004CB1] text-white font-bold'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
            onClick={() => setActiveTab('library')}
            type="button"
          >
            <FolderOpen className="size-4 text-amber-300" />
            <span>Biblioteca da Loja ({availableMediaLibrary.length})</span>
          </button>

          {/* Aba 2: Fazer Upload */}
          <button
            className={`flex items-center gap-2 border-b-2 py-3 px-4 cursor-pointer transition ${
              activeTab === 'upload'
                ? 'border-[#004CB1] text-white font-bold'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
            onClick={() => setActiveTab('upload')}
            type="button"
          >
            <UploadCloud className="size-4 text-emerald-300" />
            <span>Fazer Upload do Computador</span>
          </button>

          {/* Aba 3: URL */}
          <button
            className={`flex items-center gap-2 border-b-2 py-3 px-4 cursor-pointer transition ${
              activeTab === 'url'
                ? 'border-[#004CB1] text-white font-bold'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
            onClick={() => setActiveTab('url')}
            type="button"
          >
            <LinkIcon className="size-4 text-sky-300" />
            <span>Inserir via Link / URL</span>
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="flex flex-1 overflow-hidden">
          {/* ABA 1: BIBLIOTECA */}
          {activeTab === 'library' && (
            <>
              {/* Grid de Imagens */}
              <div className="flex flex-1 flex-col overflow-hidden p-6">
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-black/30 px-3 py-2 border border-white/10">
                  <Search className="size-4 text-white/40" />
                  <input
                    className="w-full bg-transparent text-xs text-white placeholder-white/40 outline-none"
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Filtrar banners por nome..."
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

                <div className="grid flex-1 grid-cols-2 gap-4 overflow-y-auto pr-2 sm:grid-cols-3 md:grid-cols-4">
                  {filteredMedia.map((m) => {
                    const isSelected = selectedUrl === m.url;
                    return (
                      <div
                        className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border-2 transition ${
                          isSelected
                            ? 'border-[#004CB1] ring-2 ring-[#004CB1]/50 bg-black/40'
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
                            <div className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-[#004CB1] text-white shadow-md">
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

              {/* Detalhes da Imagem */}
              <div className="hidden w-72 flex-col border-l border-white/10 bg-[#191b1d] p-5 lg:flex">
                <span className="text-xs font-bold uppercase tracking-wider text-white/60 mb-3">
                  Detalhes do Banner
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
                    Selecione um banner para visualizar detalhes.
                  </div>
                )}
              </div>
            </>
          )}

          {/* ABA 2: UPLOAD DO COMPUTADOR */}
          {activeTab === 'upload' && (
            <div className="flex flex-1 flex-col items-center justify-center p-8">
              {!uploadedPreview ? (
                <div
                  className="flex w-full max-w-lg cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/30 bg-black/20 p-10 transition hover:border-[#004CB1] hover:bg-black/40"
                  onClick={() => fileRef.current?.click()}
                >
                  <div className="flex size-16 items-center justify-center rounded-full bg-[#004CB1]/20 text-[#004CB1] mb-4">
                    <Upload className="size-8" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">
                    Clique para selecionar uma imagem do seu computador
                  </h3>
                  <p className="text-xs text-white/50">
                    Formatos suportados: PNG, JPG, WebP ou GIF
                  </p>
                  <button
                    className="mt-6 rounded-lg bg-[#004CB1] px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-[#00357B] transition cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileRef.current?.click();
                    }}
                    type="button"
                  >
                    Escolher Arquivo do PC
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-xs text-white/70 mb-3 font-semibold">
                    Imagem carregada com sucesso! Pré-visualização:
                  </span>
                  <div className="max-w-xl overflow-hidden rounded-xl border border-white/20 bg-black/40 shadow-2xl">
                    {/* eslint-disable-next-js/next/no-img-element */}
                    <img
                      alt="Uploaded preview"
                      className="max-h-72 w-auto object-contain"
                      src={uploadedPreview}
                    />
                  </div>
                  <button
                    className="mt-4 text-xs font-bold text-amber-300 hover:underline cursor-pointer"
                    onClick={() => fileRef.current?.click()}
                    type="button"
                  >
                    Trocar por outro arquivo
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ABA 3: INSERIR VIA URL */}
          {activeTab === 'url' && (
            <div className="flex flex-1 flex-col p-8">
              <label className="text-xs font-bold text-white mb-2">
                Insira o link direto da imagem (URL Web):
              </label>
              <input
                className="max-w-xl rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-xs text-white placeholder-white/40 focus:border-[#004CB1] outline-none"
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://suaimagem.com/banner.jpg"
                type="url"
                value={customUrl}
              />

              {customUrl && (
                <div className="mt-6 flex flex-col items-start">
                  <span className="text-xs text-white/60 mb-2 font-semibold">Pré-visualização:</span>
                  <div className="max-w-md overflow-hidden rounded-xl border border-white/20 bg-black/40">
                    {/* eslint-disable-next-js/next/no-img-element */}
                    <img
                      alt="Preview"
                      className="max-h-60 w-auto object-contain"
                      src={customUrl}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="flex h-16 items-center justify-between border-t border-white/10 bg-[#161719] px-6 select-none">
          <div className="text-xs text-white/60">
            {activeTab === 'upload' && uploadedPreview ? (
              <span className="text-emerald-400 font-semibold">Arquivo local pronto para inserir</span>
            ) : selectedItem ? (
              <span>Selecionado: <strong className="text-white">{selectedItem.name}</strong></span>
            ) : (
              <span>Escolha um banner acima</span>
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
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#004CB1] px-5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-[#00357B]"
              onClick={handleConfirm}
              type="button"
            >
              <Check className="size-4" />
              <span>Inserir no Banner</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
