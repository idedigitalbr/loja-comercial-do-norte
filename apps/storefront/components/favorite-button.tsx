'use client';

import { Heart } from 'lucide-react';
import { useFavorites } from './favorites-provider';
import type { FavoriteItem } from '@/lib/favorites';

type FavoriteButtonProps = {
  item: Omit<FavoriteItem, 'addedAt'>;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
};

export function FavoriteButton({
  item,
  className = '',
  size = 'md',
  showLabel = false,
}: FavoriteButtonProps) {
  const { isFavorite, toggle, ready } = useFavorites();
  const favorited = ready && isFavorite(item.id || item.productSlug);

  const iconSizes = {
    sm: 'size-3.5',
    md: 'size-4.5',
    lg: 'size-5',
  };

  return (
    <button
      aria-label={
        favorited
          ? `Remover ${item.name} dos favoritos`
          : `Adicionar ${item.name} aos favoritos`
      }
      className={
        className ||
        `flex size-8 items-center justify-center rounded-full transition cursor-pointer backdrop-blur-xs ${
          favorited
            ? 'bg-rose-50 text-[#E2091E] hover:bg-rose-100 shadow-sm'
            : 'bg-white/90 text-slate-400 hover:text-[#E2091E] hover:bg-white shadow-xs hover:scale-110 active:scale-95'
        }`
      }
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(item);
      }}
      title={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      type="button"
    >
      <Heart
        className={`${iconSizes[size]} transition-transform active:scale-125 ${
          favorited ? 'fill-[#E2091E] text-[#E2091E]' : 'stroke-[1.8]'
        }`}
      />
      {showLabel && (
        <span className="ml-1.5 text-xs font-semibold">
          {favorited ? 'Favoritado' : 'Favoritar'}
        </span>
      )}
    </button>
  );
}
