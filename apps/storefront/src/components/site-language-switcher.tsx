import { useEffect, useState } from 'react';

const LANGUAGE_STORAGE_KEY = 'site-language';

export const siteLanguages = [
  { code: 'en', label: 'English', flag: '🇺🇸', htmlLang: 'en' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', htmlLang: 'fr' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪', htmlLang: 'de' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹', htmlLang: 'it' },
  { code: 'pt', label: 'Português', flag: '🇧🇷', htmlLang: 'pt-BR' },
  { code: 'es', label: 'Español', flag: '🇪🇸', htmlLang: 'es' },
] as const;

type SiteLanguageCode = (typeof siteLanguages)[number]['code'];

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement?: new (options: { pageLanguage: string; includedLanguages: string; autoDisplay: boolean }, elementId: string) => unknown;
      };
    };
    jeGoogleTranslateInit?: () => void;
  }
}

function isLanguageCode(value: string | null): value is SiteLanguageCode {
  return siteLanguages.some((language) => language.code === value);
}

function readStoredLanguage(): SiteLanguageCode {
  if (typeof window === 'undefined') return 'pt';

  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isLanguageCode(stored) ? stored : 'pt';
  } catch {
    return 'pt';
  }
}

function getLanguage(code: SiteLanguageCode) {
  return siteLanguages.find((language) => language.code === code) ?? siteLanguages[4];
}

function applyDocumentLanguage(code: SiteLanguageCode) {
  if (typeof document !== 'undefined') document.documentElement.lang = getLanguage(code).htmlLang;
}

function applyGoogleLanguage(code: SiteLanguageCode) {
  if (typeof document === 'undefined') return;

  const select = document.querySelector<HTMLSelectElement>('select.goog-te-combo');
  if (!select || select.value === code) return;

  select.value = code;
  select.dispatchEvent(new Event('change'));
}

function initializeGoogleTranslate(elementId: string, code: SiteLanguageCode) {
  const TranslateElement = window.google?.translate?.TranslateElement;
  const element = document.getElementById(elementId);
  if (!TranslateElement || !element || element.dataset.initialized === 'true') return;

  new TranslateElement({
    pageLanguage: 'pt',
    includedLanguages: siteLanguages.map((language) => language.code).join(','),
    autoDisplay: false,
  }, elementId);
  element.dataset.initialized = 'true';
  window.setTimeout(() => applyGoogleLanguage(code), 0);
}

export function SiteLanguageSwitcher() {
  const [selectedLanguage, setSelectedLanguage] = useState<SiteLanguageCode>('pt');

  useEffect(() => {
    const storedLanguage = readStoredLanguage();
    if (storedLanguage !== 'pt') setSelectedLanguage(storedLanguage);
  }, []);

  useEffect(() => {
    applyDocumentLanguage(selectedLanguage);

    if (import.meta.env.MODE === 'test') return;

    const elementId = 'google_translate_element';
    const initialize = () => initializeGoogleTranslate(elementId, selectedLanguage);
    window.jeGoogleTranslateInit = initialize;
    initialize();

    if (!document.querySelector('script[data-je-google-translate]')) {
      const script = document.createElement('script');
      script.async = true;
      script.dataset.jeGoogleTranslate = 'true';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=jeGoogleTranslateInit';
      document.head.appendChild(script);
    }

    return () => {
      if (window.jeGoogleTranslateInit === initialize) delete window.jeGoogleTranslateInit;
    };
  }, [selectedLanguage]);

  const selectLanguage = (code: SiteLanguageCode) => {
    setSelectedLanguage(code);
    applyDocumentLanguage(code);
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    } catch {
      // The selector remains usable when browser storage is unavailable.
    }
    applyGoogleLanguage(code);
  };

  return (
    <>
      <div className="site-language-switcher" role="group" aria-label="Idiomas">
        {siteLanguages.map((language) => (
          <button
            key={language.code}
            className="site-language-switcher__button"
            type="button"
            aria-label={`Traduzir site para ${language.label}`}
            aria-pressed={selectedLanguage === language.code}
            title={language.label}
            onClick={() => selectLanguage(language.code)}
          >
            <span aria-hidden="true" className="site-language-switcher__flag">{language.flag}</span>
          </button>
        ))}
      </div>
      <div id="google_translate_element" className="site-footer__translate-engine" aria-hidden="true" inert />
    </>
  );
}
