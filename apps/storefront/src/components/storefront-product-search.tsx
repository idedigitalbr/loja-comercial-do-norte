import { FormEvent, useEffect, useRef, useState } from 'react';
import { Icon } from '@commerce/ui';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

const SEARCH_DEBOUNCE_MS = 300;

export function StorefrontProductSearch() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get('search') ?? '');
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);
  const isComposingRef = useRef(false);
  const searchParamsRef = useRef(searchParams);
  const locationKeyRef = useRef(location.key);

  function clearScheduledSearch() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  useEffect(() => {
    if (locationKeyRef.current !== location.key) {
      clearScheduledSearch();
      locationKeyRef.current = location.key;
    }
  }, [location.key]);

  useEffect(() => {
    searchParamsRef.current = searchParams;
    setQuery(searchParams.get('search') ?? '');
  }, [searchParams]);

  useEffect(() => () => {
    clearScheduledSearch();
  }, []);

  function commitSearch(value: string) {
    const normalizedValue = value.trim();
    const nextSearchParams = new URLSearchParams(searchParamsRef.current);
    nextSearchParams.delete('page');
    if (normalizedValue) nextSearchParams.set('search', normalizedValue);
    else nextSearchParams.delete('search');

    navigate({
      pathname: '/loja',
      search: nextSearchParams.toString() ? `?${nextSearchParams.toString()}` : '',
    });
  }

  function scheduleSearch(value: string) {
    clearScheduledSearch();
    if (!value.trim()) {
      commitSearch('');
      return;
    }
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      commitSearch(value);
    }, SEARCH_DEBOUNCE_MS);
  }

  function handleChange(value: string) {
    setQuery(value);
    if (!isComposingRef.current) scheduleSearch(value);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isComposingRef.current) return;
    clearScheduledSearch();
    commitSearch(query);
  }

  function handleClear() {
    clearScheduledSearch();
    setQuery('');
    commitSearch('');
    inputRef.current?.focus();
  }

  return (
    <form className="storefront-search" role="search" aria-label="Buscar produtos na loja" onSubmit={handleSubmit}>
      <Icon className="storefront-search__icon" name="search" size={18} strokeWidth={1.8} aria-hidden="true" />
      <label className="sr-only" htmlFor="storefront-product-search">Buscar produtos</label>
      <input
        ref={inputRef}
        id="storefront-product-search"
        type="search"
        value={query}
        placeholder="Buscar produtos..."
        autoComplete="off"
        onChange={(event) => handleChange(event.currentTarget.value)}
        onCompositionStart={() => { isComposingRef.current = true; }}
        onCompositionEnd={(event) => {
          isComposingRef.current = false;
          handleChange(event.currentTarget.value);
        }}
        aria-label="Buscar produtos"
      />
      {query ? <button className="storefront-search__clear" type="button" aria-label="Limpar busca" onClick={handleClear}><Icon name="x" size={15} strokeWidth={2} /></button> : null}
      <button className="storefront-search__submit" type="submit" aria-label="Buscar produtos"><Icon name="arrow-right" size={17} strokeWidth={2} /></button>
    </form>
  );
}
