import { useEffect, useState } from 'react';

const LANGUAGE_STORAGE_KEY = 'site-language';

export const siteLanguages = [
  { code: 'en', label: 'English', flag: 'us', htmlLang: 'en' },
  { code: 'fr', label: 'Français', flag: 'fr', htmlLang: 'fr' },
  { code: 'de', label: 'Deutsch', flag: 'de', htmlLang: 'de' },
  { code: 'it', label: 'Italiano', flag: 'it', htmlLang: 'it' },
  { code: 'pt', label: 'Português', flag: 'br', htmlLang: 'pt-BR' },
  { code: 'es', label: 'Español', flag: 'es', htmlLang: 'es' },
] as const;

type SiteLanguageCode = (typeof siteLanguages)[number]['code'];
type SiteLanguageFlag = (typeof siteLanguages)[number]['flag'];

function LanguageFlag({ country }: { country: SiteLanguageFlag }) {
  return (
    <svg className="site-language-switcher__flag" viewBox="0 0 24 16" aria-hidden="true" focusable="false" data-flag={country}>
      {country === 'us' ? (
        <>
          {Array.from({ length: 13 }, (_, stripe) => <rect key={stripe} y={(stripe * 16) / 13} width="24" height={16 / 13} fill={stripe % 2 === 0 ? '#b22234' : '#fff'} />)}
          <rect width="10.5" height="8.7" fill="#3c3b6e" />
          {[0, 1, 2, 3, 4, 5].map((star) => <circle key={star} cx={2 + (star % 3) * 3} cy={1.7 + Math.floor(star / 3) * 3.2} r="0.55" fill="#fff" />)}
        </>
      ) : null}
      {country === 'fr' ? <><rect width="8" height="16" fill="#002395" /><rect x="8" width="8" height="16" fill="#fff" /><rect x="16" width="8" height="16" fill="#ed2939" /></> : null}
      {country === 'de' ? <><rect width="24" height="5.33" fill="#111" /><rect y="5.33" width="24" height="5.34" fill="#d00" /><rect y="10.67" width="24" height="5.33" fill="#ffce00" /></> : null}
      {country === 'it' ? <><rect width="8" height="16" fill="#009246" /><rect x="8" width="8" height="16" fill="#fff" /><rect x="16" width="8" height="16" fill="#ce2b37" /></> : null}
      {country === 'br' ? <><rect width="24" height="16" fill="#009b3a" /><polygon points="12,1.5 22,8 12,14.5 2,8" fill="#ffdf00" /><circle cx="12" cy="8" r="3.5" fill="#002776" /></> : null}
      {country === 'es' ? <><rect width="24" height="4" fill="#aa151b" /><rect y="4" width="24" height="8" fill="#f1bf00" /><rect y="12" width="24" height="4" fill="#aa151b" /></> : null}
    </svg>
  );
}

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
            <LanguageFlag country={language.flag} />
          </button>
        ))}
      </div>
      <div id="google_translate_element" className="site-footer__translate-engine" aria-hidden="true" inert />
    </>
  );
}
