import React from 'react';
import { Globe, RotateCcw, Check, Type, Clock, ArrowLeftRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { LANGUAGES, ALL_LANGUAGES } from '@/lib/i18n/languages';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';

/**
 * Language & Region Section — Global Internationalization Framework™
 *
 * Shows current language, RTL status, timezone, and the full language picker.
 * User preference overrides workspace/org/platform defaults.
 */
export default function LanguageRegionSection() {
  const { language, languageMeta, isRTL, timezone, timezoneName, userLanguage, clearUserLanguage, allowedLanguages, t } = useTranslation();

  const availableLanguages = ALL_LANGUAGES.filter((l) => allowedLanguages.includes(l.code));
  const hasOverride = userLanguage !== null;

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6 space-y-5">
      <div className="flex items-center gap-2">
        <Globe size={16} className="text-indigo-400" />
        <h2 className="text-white font-semibold text-sm">{t('settings.language_region') || 'Language & Region'}</h2>
      </div>

      {/* Current Language Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
          <div className="flex items-center gap-1.5 text-white/30 text-[10px] uppercase tracking-wider mb-2">
            <Globe size={11} /> {t('settings.current_language') || 'Current Language'}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{languageMeta?.flag}</span>
            <div>
              <div className="text-white text-sm font-medium">{languageMeta?.nativeName}</div>
              <div className="text-white/40 text-xs">{languageMeta?.name}</div>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
          <div className="flex items-center gap-1.5 text-white/30 text-[10px] uppercase tracking-wider mb-2">
            <ArrowLeftRight size={11} /> {t('settings.text_direction') || 'Text Direction'}
          </div>
          <div className="text-white text-sm font-medium">
            {isRTL ? 'Right-to-Left (RTL)' : 'Left-to-Right (LTR)'}
          </div>
          <div className="text-white/40 text-xs mt-0.5">
            {isRTL ? 'Layout automatically mirrored' : 'Standard reading direction'}
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
          <div className="flex items-center gap-1.5 text-white/30 text-[10px] uppercase tracking-wider mb-2">
            <Clock size={11} /> {t('settings.timezone') || 'Timezone'}
          </div>
          <div className="text-white text-sm font-medium">{timezoneName || timezone || 'UTC'}</div>
          <div className="text-white/40 text-xs mt-0.5">{timezone || '—'}</div>
        </div>
      </div>

      {/* Language Picker */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-white/40 text-xs">
            <Type size={12} /> {t('settings.select_language') || 'Select your preferred language'}
          </div>
          {hasOverride && (
            <button
              onClick={clearUserLanguage}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              <RotateCcw size={11} /> {t('settings.reset_default') || 'Reset to platform default'}
            </button>
          )}
        </div>
        <LanguageSwitcher />
        <p className="text-white/30 text-xs leading-relaxed pt-1">
          {t('settings.language_hint') || 'Your preference is saved across sessions and overrides workspace and organization defaults. Dates, numbers, and currency adapt automatically.'}
        </p>
      </div>

      {/* Available Languages Grid */}
      <div>
        <div className="text-white/30 text-[10px] uppercase tracking-wider mb-3">
          {t('settings.available_languages') || 'Available Languages'}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {availableLanguages.map((lang) => (
            <div
              key={lang.code}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-colors ${
                language === lang.code
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-white'
                  : 'bg-white/[0.02] border-white/5 text-white/50'
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">{lang.nativeName}</div>
                <div className="text-[10px] text-white/30 truncate">{lang.name}</div>
              </div>
              {language === lang.code && <Check size={13} className="text-indigo-400 shrink-0" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}