import React, { useMemo } from 'react';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { LANGUAGES } from '@/lib/i18n/languages';
import {
  generateLocalizationReport,
  computeLocalizationHealthScore,
  computeLocalizationReadiness,
} from '@/lib/i18n/localizationHealthEngine';
import {
  Globe, CheckCircle2, AlertCircle, TrendingUp, Languages,
  ShieldCheck, Type, ArrowLeftRight, FileText,
} from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

function StatCard({ icon: Icon, label, value, sub, color = '#6366f1' }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <Icon size={16} style={{ color }} />
      <div className="text-2xl font-bold text-white mt-2">{value}</div>
      <div className="text-xs text-white/40">{label}</div>
      {sub && <div className="text-[10px] text-white/30 mt-0.5">{sub}</div>}
    </div>
  );
}

function CoverageBar({ percent }) {
  const color = percent >= 80 ? '#10b981' : percent >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percent}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs text-white/60 w-10 text-right">{percent}%</span>
    </div>
  );
}

export default function LocalizationDashboard() {
  const { t, language, timezoneName } = useTranslation();

  const report = useMemo(() => generateLocalizationReport(), []);
  const health = useMemo(() => computeLocalizationHealthScore(), []);
  const readiness = useMemo(() => computeLocalizationReadiness(), []);

  const healthColor = health.healthScore >= 80 ? '#10b981' : health.healthScore >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
            <Globe size={12} className="text-indigo-400" /> Enterprise Internationalization™ & Localization Platform
          </div>
          <h1 className="text-2xl font-bold text-white">{t('localization.title')}</h1>
          <p className="text-white/40 text-sm mt-1">{t('localization.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher compact />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Languages} label={t('localization.supported_languages')} value={health.totalLanguages} sub={`${health.phase1Languages} Phase 1 active`} color="#6366f1" />
        <StatCard icon={TrendingUp} label={t('localization.translation_coverage')} value={`${health.avgCoverage}%`} sub={`${health.totalKeys} translation keys`} color="#10b981" />
        <StatCard icon={AlertCircle} label={t('localization.missing_strings')} value={health.criticalMissing} sub="critical keys missing" color="#f59e0b" />
        <StatCard icon={ShieldCheck} label={t('localization.health_score')} value={health.healthScore} sub={readiness.ready ? 'Certified Ready' : 'Needs Attention'} color={healthColor} />
      </div>

      {/* Localization Readiness™ */}
      <div className={`rounded-xl p-5 border ${readiness.ready ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
        <div className="flex items-center gap-3">
          {readiness.ready ? (
            <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={20} className="text-amber-400 shrink-0" />
          )}
          <div>
            <h3 className="text-sm font-semibold text-white">{t('localization.readiness')}</h3>
            <p className="text-xs text-white/50 mt-0.5">
              {readiness.ready
                ? 'Localization framework is certified and production-ready.'
                : `Not ready: ${readiness.failures.join(', ')}`}
            </p>
          </div>
        </div>
      </div>

      {/* Translation Coverage by Language */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe size={16} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">{t('localization.translation_coverage')}</h3>
        </div>
        <div className="space-y-3">
          {report.languages.map((lang) => (
            <div key={lang.code} className="flex items-center gap-3">
              <span className="text-xl w-8">{lang.flag}</span>
              <div className="w-40 shrink-0">
                <div className="text-sm text-white">{lang.nativeName}</div>
                <div className="text-[10px] text-white/30">
                  {lang.code.toUpperCase()} {lang.canonical && `· ${t('localization.canonical')}`}
                  {lang.rtl && ' · RTL'}
                </div>
              </div>
              <div className="flex-1">
                <CoverageBar percent={lang.coveragePercent} />
              </div>
              <span className="text-xs text-white/40 w-20 text-right">
                {lang.translated}/{lang.total}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Health Breakdown */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck size={16} className="text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">{t('localization.health_score')} — Breakdown</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: t('localization.translation_coverage'), value: health.breakdown.coverage, icon: TrendingUp, color: '#10b981' },
            { label: 'Critical Keys', value: health.breakdown.criticalKeys, icon: AlertCircle, color: '#f59e0b' },
            { label: t('localization.rtl_ready'), value: health.breakdown.rtl, icon: ArrowLeftRight, color: '#8b5cf6' },
            { label: t('localization.font_support'), value: health.breakdown.fonts, icon: Type, color: '#06b6d4' },
            { label: 'Fallback Integrity', value: health.breakdown.fallback, icon: ShieldCheck, color: '#6366f1' },
          ].map((item) => (
            <div key={item.label} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <item.icon size={14} style={{ color: item.color }} />
              <div className="text-lg font-bold text-white mt-1">{item.value}%</div>
              <div className="text-[10px] text-white/40">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Runtime Environment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Type size={16} className="text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Runtime Environment</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-white/40">{t('language.label')}</span>
              <span className="text-white">{LANGUAGES[language]?.nativeName || 'English'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Locale</span>
              <span className="text-white/80">{LANGUAGES[language]?.locale || 'en-US'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Text Direction</span>
              <span className="text-white/80">{LANGUAGES[language]?.rtl ? 'RTL (Right-to-Left)' : 'LTR (Left-to-Right)'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Timezone</span>
              <span className="text-white/80">{timezoneName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Font Stack</span>
              <span className="text-white/60 text-[10px] max-w-[200px] truncate">{LANGUAGES[language]?.fontStack}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={16} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-white">{t('localization.enterprise_governance')}</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-white/40">{t('localization.default_language')}</span>
              <span className="text-white/80">English (Canonical)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">{t('localization.allowed_languages')}</span>
              <span className="text-white/80">{health.totalLanguages}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Multi-Currency Support</span>
              <span className="text-white/80">{health.supportedCurrencies} currencies</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">RTL Architecture</span>
              <span className="text-white/80">{health.rtlReady ? '✓ Ready' : 'In Progress'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">{t('localization.last_update')}</span>
              <span className="text-white/80">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Language Preference */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe size={16} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">{t('language.select')}</h3>
        </div>
        <LanguageSwitcher />
        <p className="text-[10px] text-white/30 mt-2">
          {t('language.preference_saved')}. Runtime switching — no logout or refresh required.
        </p>
      </div>
    </div>
  );
}