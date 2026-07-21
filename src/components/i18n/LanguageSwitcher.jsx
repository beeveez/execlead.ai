import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { LANGUAGES, ALL_LANGUAGES } from '@/lib/i18n/languages';

/**
 * Language Switcher™ — Global Language Selector
 *
 * Available in: Header, Account Settings, User Profile, Enterprise Settings,
 * Authentication, Onboarding.
 *
 * Runtime switching — no logout, no page refresh required.
 * Language preference persists across sessions via localStorage.
 */
export default function LanguageSwitcher({ compact = false, showLabel = true, className = '' }) {
  const { language, setUserLanguage, allowedLanguages, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const availableLanguages = ALL_LANGUAGES.filter((l) =>
    allowedLanguages.includes(l.code)
  );

  const currentLang = LANGUAGES[language] || LANGUAGES.en;

  if (compact) {
    return (
      <div ref={ref} className={`relative ${className}`}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-white/60 hover:text-white text-xs"
          aria-label={t('language.switch')}
        >
          <Globe size={14} />
          <span>{currentLang.flag}</span>
          <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-1 w-44 bg-[#0d0d14] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
            {availableLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setUserLanguage(lang.code);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-white/5 transition-colors ${
                  language === lang.code ? 'text-indigo-400 bg-white/5' : 'text-white/60'
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                <span className="flex-1 text-left">{lang.nativeName}</span>
                {language === lang.code && <Check size={12} />}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors text-sm text-white"
        aria-label={t('language.switch')}
      >
        <span className="flex items-center gap-2">
          <Globe size={16} className="text-white/40" />
          <span className="text-lg">{currentLang.flag}</span>
          {showLabel && (
            <span className="flex flex-col items-start">
              <span className="text-sm">{currentLang.nativeName}</span>
              <span className="text-[10px] text-white/30">{currentLang.name}</span>
            </span>
          )}
        </span>
        <ChevronDown size={16} className={`text-white/40 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-[#0d0d14] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden max-h-72 overflow-y-auto">
          {availableLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setUserLanguage(lang.code);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-white/5 transition-colors ${
                language === lang.code ? 'text-indigo-400 bg-indigo-500/5' : 'text-white/70'
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="flex-1 text-left">
                <div>{lang.nativeName}</div>
                <div className="text-[10px] text-white/30">{lang.name}</div>
              </span>
              {language === lang.code && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}