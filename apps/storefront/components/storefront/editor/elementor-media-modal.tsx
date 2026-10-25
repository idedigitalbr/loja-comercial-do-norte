'use client';

import React, { useRef, useState } from 'react';
import {
  Check,
  FolderOpen,
  Image as ImageIcon,
  Link as LinkIcon,
  Search,
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
  slideTitle?: string;
  title?: string;
}

export function ElementorMediaModal({
  isOpen,
  onClose,
  onSelectImage,
  currentImageUrl,
  slideTitle,
  title = 'Selecionar ou Enviar Imagem do Banner',
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
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="flex h-[88vh] w-full max-w-5xl flex-col rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          ref={fileRef}
          type="file"
        />

        {/* Cabeçalho Shadcn Dark Mode */}
        <div className="flex h-14 items-center justify-between border-b border-zinc-800/80 bg-zinc-950 px-6 select-none">
          <div className="flex items-center gap-3">
            <div className="flex size-7 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-sky-400 font-bold text-xs">
              <ImageIcon className="size-4" />
            </div>
            <h2 className="text-sm font-semibold tracking-wide text-white">{title}</h2>
          </div>

          <button
            aria-label="Fechar"
            className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white transition"
            onClick={onClose}
            type="button"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* 3 Abas Estilo Shadcn */}
        <div className="flex border-b border-zinc-800/80 bg-zinc-900/40 px-6 text-xs font-medium select-none">
          <button
            className={`flex items-center gap-2 border-b-2 py-3 px-4 cursor-pointer transition ${
              activeTab === 'library'
                ? 'border-sky-400 text-white font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
            onClick={() => setActiveTab('library')}
            type="button"
          >
            <FolderOpen className="size-4 text-sky-400" />
            <span>Biblioteca da Loja ({availableMediaLibrary.length})</span>
          </button>

          <button
            className={`flex items-center gap-2 border-b-2 py-3 px-4 cursor-pointer transition ${
              activeTab === 'upload'
                ? 'border-sky-400 text-white font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
            onClick={() => setActiveTab('upload')}
            type="button"
          >
            <UploadCloud className="size-4 text-emerald-400" />
            <span>Fazer Upload do Computador</span>
          </button>

          <button
            className={`flex items-center gap-2 border-b-2 py-3 px-4 cursor-pointer transition ${
              activeTab === 'url'
                ? 'border-sky-400 text-white font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
            onClick={() => setActiveTab('url')}
            type="button"
          >
            <LinkIcon className="size-4 text-zinc-400" />
            <span>URL Externa da Imagem</span>
          </button>
        </div>

        {/* Item Sendo Alterado Preview Bar */}
        {(slideTitle || currentImageUrl) && (
          <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/20 px-6 py-2.5 text-xs">
            <div className="flex items-center gap-3">
              {currentImageUrl ? (
                <div className="size-8 shrink-0 overflow-hidden rounded border border-zinc-800 bg-black">
                  {/* eslint-disable-next-js/next/no-img-element */}
                  <img alt={slideTitle || ''} className="size-full object-cover" src={currentImageUrl} />
                </div>
              ) : null}
              <span className="text-zinc-400">
                Item atual sendo alterado: <strong className="text-white">{slideTitle || 'Slide do Banner'}</strong>
              </span>
            </div>
            {currentImageUrl ? (
              <span className="text-[11px] text-zinc-500 hidden sm:inline">
                A nova imagem substituirá este slide
              </span>
            ) : null}
          </div>
        )}

        {/* Corpo do Modal */}
        <div className="flex flex-1 overflow-hidden">
          {activeTab === 'library' && (
            <>
              <div className="flex flex-1 flex-col overflow-hidden p-6">
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-zinc-900/80 px-3 py-2 border border-zinc-800">
                  <Search className="size-4 text-zinc-400" />
                  <input
                    className="w-full bg-transparent text-xs text-white placeholder-zinc-500 outline-none"
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Filtrar banners por nome..."
                    type="text"
                    value={search}
                  />
                  {search && (
                    <button
                      className="text-zinc-500 hover:text-white text-xs cursor-pointer"
                      onClick={() => setSearch('')}
                      type="button"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                <div className="grid flex-1 grid-cols-2 gap-3.5 overflow-y-auto pr-2 sm:grid-cols-3 md:grid-cols-4">
                  {filteredMedia.map((m) => {
                    const isSelected = selectedUrl === m.url;
                    return (
                      <div
                        className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border transition ${
                          isSelected
                            ? 'border-sky-400 ring-2 ring-sky-500/30 bg-zinc-900'
                            : 'border-zinc-800 hover:border-zinc-600 bg-zinc-900/40'
                        }`}
                        key={m.id}
                        onClick={() => setSelectedUrl(m.url)}
                        onDoubleClick={handleConfirm}
                      >
                        <div className="relative aspect-video w-full overflow-hidden bg-black">
                          {/* eslint-disable-next-js/next/no-img-element */}
                          <img
                            alt={m.name}
                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                            src={m.url}
                          />
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-sky-500 text-zinc-950 shadow-md">
                              <Check className="size-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <div className="p-2.5">
                          <span className="block truncate text-[11px] font-medium text-zinc-200">
                            {m.name}
                          </span>
                          <span className="text-[10px] text-zinc-500">{m.category}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Painel de Detalhes Lateral */}
              <div className="hidden w-72 flex-col border-l border-zinc-800/80 bg-zinc-950/60 p-5 lg:flex">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                  Detalhes do Banner
                </span>

                {selectedItem ? (
                  <div className="flex flex-col gap-3">
                    <div className="aspect-video w-full overflow-hidden rounded-xl border border-zinc-800 bg-black">
                      {/* eslint-disable-next-js/next/no-img-element */}
                      <img
                        alt={selectedItem.name}
                        className="h-full w-full object-cover"
                        src={selectedItem.url}
                      />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white break-words">
                        {selectedItem.name}
                      </div>
                      <div className="mt-1 text-[11px] text-zinc-400">
                        Categoria: {selectedItem.category}
                      </div>
                      <div className="mt-2 rounded-lg bg-zinc-900 border border-zinc-800 p-2 text-[10px] text-zinc-400 font-mono break-all">
                        {selectedItem.url}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-1 items-center justify-center text-center text-xs text-zinc-500">
                    Selecione um banner para visualizar detalhes.
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'upload' && (
            <div className="flex flex-1 flex-col items-center justify-center p-8">
              {!uploadedPreview ? (
                <div
                  className="flex w-full max-w-lg cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/30 p-10 transition hover:border-sky-400 hover:bg-zinc-900/60"
                  onClick={() => fileRef.current?.click()}
                >
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-sky-400 mb-4 shadow-sm">
                    <UploadCloud className="size-7" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">
                    Selecione uma imagem do seu computador
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Formatos suportados: PNG, JPG, WebP ou GIF
                  </p>
                  <button
                    className="mt-6 rounded-xl bg-white px-5 py-2 text-xs font-bold text-zinc-950 shadow-md hover:bg-zinc-200 transition cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileRef.current?.click();
                    }}
                    type="button"
                  >
                    Escolher Arquivo
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-xs text-zinc-400 mb-3 font-medium">
                    Pré-visualização da imagem carregada:
                  </span>
                  <div className="max-w-xl overflow-hidden rounded-2xl border border-zinc-800 bg-black shadow-2xl">
                    {/* eslint-disable-next-js/next/no-img-element */}
                    <img
                      alt="Uploaded preview"
                      className="max-h-72 w-auto object-contain"
                      src={uploadedPreview}
                    />
                  </div>
                  <button
                    className="mt-4 text-xs font-semibold text-sky-400 hover:underline cursor-pointer"
                    onClick={() => fileRef.current?.click()}
                    type="button"
                  >
                    Escolher outro arquivo
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'url' && (
            <div className="flex flex-1 flex-col p-8">
              <label className="text-xs font-medium text-zinc-300 mb-2">
                Insira o link direto da imagem (URL Web):
              </label>
              <input
                className="max-w-xl rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-sky-400 outline-none"
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://suaimagem.com/banner.jpg"
                type="url"
                value={customUrl}
              />

              {customUrl && (
                <div className="mt-6 flex flex-col items-start">
                  <span className="text-xs text-zinc-400 mb-2 font-medium">Pré-visualização:</span>
                  <div className="max-w-md overflow-hidden rounded-xl border border-zinc-800 bg-black">
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

        {/* Rodapé Shadcn */}
        <div className="flex h-16 items-center justify-between border-t border-zinc-800/80 bg-zinc-950 px-6 select-none">
          <div className="text-xs text-zinc-400">
            {activeTab === 'upload' && uploadedPreview ? (
              <span className="text-emerald-400 font-medium">Arquivo pronto para uso</span>
            ) : selectedItem ? (
              <span>Selecionado: <strong className="text-white">{selectedItem.name}</strong></span>
            ) : (
              <span>Escolha um banner acima</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              className="rounded-xl px-4 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white transition cursor-pointer"
              onClick={onClose}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-5 py-2 text-xs font-bold text-zinc-950 shadow-md transition hover:bg-zinc-200"
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
