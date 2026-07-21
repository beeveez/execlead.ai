import React, { useState, useMemo } from 'react';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { LANGUAGES } from '@/lib/i18n/languages';
import { getLocalizationIntelligenceSnapshot, getLocalizationIntelligence } from '@/lib/i18n/localizationIntelligenceEngine';
import { getAILocalizationSnapshot } from '@/lib/i18n/aiLocalizationEngine';
import { getLanguagePacks, getLanguagePackVersionHistory, getLanguagePackDiff, getTranslationReviewWorkflow, getLocalizationAuditLog, getLanguagePackCertification } from '@/lib/i18n/languagePackEngine';
import {
  Globe, LayoutGrid, BarChart3, Database, Activity, ShieldCheck, Brain, Package, ScrollText,
} from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import LocalizationExportBar from './sections/LocalizationExportBar';
import TranslationCoverageSection from './sections/TranslationCoverageSection';
import ModuleCoverageSection from './sections/ModuleCoverageSection';
import LocalizationHealthSection from './sections/LocalizationHealthSection';
import MissingTranslationRegistry from './sections/MissingTranslationRegistry';
import HardcodedStringDetector from './sections/HardcodedStringDetector';
import LocalizationQualitySection from './sections/LocalizationQualitySection';
import RuntimeLanguageAnalytics from './sections/RuntimeLanguageAnalytics';
import EnterpriseLanguageGovernance from './sections/EnterpriseLanguageGovernance';
import LocalizationReadinessSection from './sections/LocalizationReadinessSection';
import LocalizationCertification from './sections/LocalizationCertification';
import GuardianIntegration from './sections/GuardianIntegration';
import TrendHistorySection from './sections/TrendHistorySection';
import LocalizationIntelligenceDrawer from './sections/LocalizationIntelligenceDrawer';
import AILocalizationSection from './sections/AILocalizationSection';
import AILocalizationAnalytics from './sections/AILocalizationAnalytics';
import AILocalizationConfidence from './sections/AILocalizationConfidence';
import PromptLocalizationSection from './sections/PromptLocalizationSection';
import ResponseValidationSection from './sections/ResponseValidationSection';
import EnterpriseTerminologySection from './sections/EnterpriseTerminologySection';
import AILocalizationTrends from './sections/AILocalizationTrends';
import LanguagePackManagement from './sections/LanguagePackManagement';
import LanguagePackVersionHistory from './sections/LanguagePackVersionHistory';
import LanguagePackDiff from './sections/LanguagePackDiff';
import TranslationReviewWorkflow from './sections/TranslationReviewWorkflow';
import LanguagePackCertification from './sections/LanguagePackCertification';
import LocalizationAuditLog from './sections/LocalizationAuditLog';
import ReleaseIntegritySection from './sections/ReleaseIntegritySection';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'coverage', label: 'Coverage', icon: BarChart3 },
  { id: 'registry', label: 'Registry', icon: Database },
  { id: 'analytics', label: 'Analytics', icon: Activity },
  { id: 'ai_localization', label: 'AI Localization', icon: Brain },
  { id: 'language_packs', label: 'Language Packs', icon: Package },
  { id: 'governance', label: 'Governance', icon: ShieldCheck },
  { id: 'guardian', label: 'Guardian™', icon: Globe },
  { id: 'audit', label: 'Audit Log', icon: ScrollText },
];

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

function handleExport(type, snapshot, aiSnapshot, packs, auditLog) {
  let data, filename, mime;
  const ts = new Date().toISOString().split('T')[0];

  if (type === 'json') {
    data = JSON.stringify(snapshot, null, 2);
    filename = `localization-${type}-${ts}.json`;
    mime = 'application/json';
  } else if (type === 'audit') {
    data = JSON.stringify({ auditLog, generatedAt: new Date().toISOString() }, null, 2);
    filename = `localization-audit-${ts}.json`;
    mime = 'application/json';
  } else if (type === 'ai_localization') {
    data = JSON.stringify(aiSnapshot, null, 2);
    filename = `ai-localization-report-${ts}.json`;
    mime = 'application/json';
  } else if (type === 'language_pack') {
    data = JSON.stringify({ packs, generatedAt: new Date().toISOString() }, null, 2);
    filename = `language-pack-report-${ts}.json`;
    mime = 'application/json';
  } else if (type === 'certification') {
    const certs = packs.map((p) => getLanguagePackCertification(p.code));
    data = JSON.stringify({ certifications: certs, generatedAt: new Date().toISOString() }, null, 2);
    filename = `certification-report-${ts}.json`;
    mime = 'application/json';
  } else if (type === 'executive') {
    data = JSON.stringify({ localization: snapshot, aiLocalization: aiSnapshot, languagePacks: packs, auditLog, generatedAt: new Date().toISOString() }, null, 2);
    filename = `executive-localization-report-${ts}.json`;
    mime = 'application/json';
  } else {
    const isGapReport = type === 'gap' || type === 'missing';
    const rows = isGapReport
      ? snapshot.missingRegistry.map((r) => [r.key, r.englishText, r.missingLanguage, r.module, r.priority, r.owner])
      : snapshot.translationCoverage.map((l) => [l.name, l.code, l.coveragePercent, l.translated, l.missing, l.status]);
    const headers = isGapReport
      ? ['Key', 'English', 'Missing Language', 'Module', 'Priority', 'Owner']
      : ['Language', 'Code', 'Coverage %', 'Translated', 'Missing', 'Status'];
    data = [headers, ...rows].map((r) => r.join(',')).join('\n');
    filename = `localization-${type}-${ts}.csv`;
    mime = 'text/csv';
  }

  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function LocalizationDashboard() {
  const { t, language, timezoneName } = useTranslation();
  const [tab, setTab] = useState('overview');
  const [drawerIssue, setDrawerIssue] = useState(null);
  const [selectedPack, setSelectedPack] = useState('ja');

  const snapshot = useMemo(() => getLocalizationIntelligenceSnapshot(), []);
  const aiSnapshot = useMemo(() => getAILocalizationSnapshot(), []);
  const packs = useMemo(() => getLanguagePacks(), []);
  const auditLog = useMemo(() => getLocalizationAuditLog(), []);
  const intelligence = useMemo(() => drawerIssue ? getLocalizationIntelligence(drawerIssue) : null, [drawerIssue]);

  const packHistory = useMemo(() => selectedPack ? getLanguagePackVersionHistory(selectedPack) : [], [selectedPack]);
  const packDiff = useMemo(() => packHistory.length >= 2 ? getLanguagePackDiff(selectedPack, packHistory[0].version, packHistory[1].version) : null, [selectedPack, packHistory]);
  const reviewWorkflow = useMemo(() => selectedPack ? getTranslationReviewWorkflow(selectedPack) : null, [selectedPack]);
  const packCert = useMemo(() => selectedPack ? getLanguagePackCertification(selectedPack) : null, [selectedPack]);

  const h = snapshot.health;
  const healthColor = h.healthScore >= 80 ? '#10b981' : h.healthScore >= 60 ? '#f59e0b' : '#ef4444';

  // Merge AI guardian issues into the existing guardian integration
  const mergedGuardian = useMemo(() => ({
    ...snapshot.guardian,
    issues: [...snapshot.guardian.issues, ...aiSnapshot.guardian.issues],
    overallScore: Math.round((snapshot.guardian.overallScore + aiSnapshot.guardian.overallScore) / 2),
  }), [snapshot.guardian, aiSnapshot.guardian]);

  const exportHandler = (type) => handleExport(type, snapshot, aiSnapshot, packs, auditLog);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
            <Globe size={12} className="text-indigo-400" /> Localization Intelligence Platform™ · v2.1
          </div>
          <h1 className="text-2xl font-bold text-white">{t('localization.title')}</h1>
          <p className="text-white/40 text-sm mt-1">AI Localization Intelligence, Language Pack Governance, and Certification</p>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher compact />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Globe} label="Supported Languages" value={h.totalLanguages} sub={`${h.phase1Languages} Phase 1 active`} color="#6366f1" />
        <StatCard icon={BarChart3} label="Avg Translation Coverage" value={`${h.avgCoverage}%`} sub={`${h.totalKeys} translation keys`} color="#10b981" />
        <StatCard icon={Brain} label="AI Localization Score" value={aiSnapshot.score.score} sub={`Grade ${aiSnapshot.score.grade}`} color="#06b6d4" />
        <StatCard icon={ShieldCheck} label="Health Score" value={h.healthScore} sub={snapshot.readiness.status} color={healthColor} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/5 overflow-x-auto">
        {TABS.map((tb) => (
          <button key={tb.id} onClick={() => setTab(tb.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === tb.id ? 'border-indigo-400 text-indigo-400' : 'border-transparent text-white/40 hover:text-white/70'
            }`}>
            <tb.icon size={14} /> {tb.label}
          </button>
        ))}
      </div>

      {/* Export Bar */}
      <LocalizationExportBar onExport={exportHandler} />

      {/* Tab Content */}
      {tab === 'overview' && (
        <div className="space-y-4">
          <LocalizationReadinessSection readiness={snapshot.readiness} />
          <AILocalizationSection score={aiSnapshot.score} />
          <LocalizationHealthSection health={h} />
          <LocalizationQualitySection quality={snapshot.quality} />
        </div>
      )}

      {tab === 'coverage' && (
        <div className="space-y-4">
          <TranslationCoverageSection coverage={snapshot.translationCoverage} />
          <ModuleCoverageSection modules={snapshot.moduleCoverage} onModuleClick={() => setDrawerIssue('blocking_modules')} />
        </div>
      )}

      {tab === 'registry' && (
        <div className="space-y-4">
          <MissingTranslationRegistry registry={snapshot.missingRegistry} onExport={exportHandler} />
          <HardcodedStringDetector data={snapshot.hardcodedStrings} />
        </div>
      )}

      {tab === 'analytics' && (
        <div className="space-y-4">
          <RuntimeLanguageAnalytics data={snapshot.runtime} />
          <AILocalizationAnalytics analytics={aiSnapshot.analytics} />
          <TrendHistorySection trends={snapshot.trends} />
          <AILocalizationTrends trends={aiSnapshot.trends} />
        </div>
      )}

      {tab === 'ai_localization' && (
        <div className="space-y-4">
          <AILocalizationSection score={aiSnapshot.score} />
          <AILocalizationAnalytics analytics={aiSnapshot.analytics} />
          <AILocalizationConfidence confidence={aiSnapshot.confidence} />
          <PromptLocalizationSection promptContext={aiSnapshot.promptContext} />
          <ResponseValidationSection validation={aiSnapshot.responseValidation} />
          <EnterpriseTerminologySection terminology={aiSnapshot.terminology} />
        </div>
      )}

      {tab === 'language_packs' && (
        <div className="space-y-4">
          <LanguagePackManagement packs={packs} onSelectPack={setSelectedPack} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LanguagePackVersionHistory history={packHistory} langName={LANGUAGES[selectedPack]?.name} />
            <TranslationReviewWorkflow workflow={reviewWorkflow} />
          </div>
          <LanguagePackDiff diff={packDiff} />
          <LanguagePackCertification cert={packCert} />
        </div>
      )}

      {tab === 'governance' && (
        <div className="space-y-4">
          <EnterpriseLanguageGovernance data={snapshot.governance} />
          <ReleaseIntegritySection integrity={aiSnapshot.releaseIntegrity} />
          <LocalizationCertification cert={snapshot.certification} />
        </div>
      )}

      {tab === 'guardian' && (
        <div className="space-y-4">
          <GuardianIntegration guardian={mergedGuardian} onIssueClick={(id) => setDrawerIssue(id)} />
        </div>
      )}

      {tab === 'audit' && (
        <div className="space-y-4">
          <LocalizationAuditLog logs={auditLog} />
        </div>
      )}

      {/* Runtime Environment + Language Preference (always visible) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Globe size={16} className="text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Runtime Environment</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-white/40">{t('language.label')}</span><span className="text-white">{LANGUAGES[language]?.nativeName || 'English'}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Locale</span><span className="text-white/80">{LANGUAGES[language]?.locale || 'en-US'}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Text Direction</span><span className="text-white/80">{LANGUAGES[language]?.rtl ? 'RTL' : 'LTR'}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Timezone</span><span className="text-white/80">{timezoneName}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Pack Version</span><span className="text-white/80">{snapshot.runtime.languagePackVersion}</span></div>
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={16} className="text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">{t('language.select')}</h3>
          </div>
          <LanguageSwitcher />
          <p className="text-[10px] text-white/30 mt-2">{t('language.preference_saved')}. Runtime switching — no refresh required.</p>
        </div>
      </div>

      {/* Intelligence Drawer */}
      {intelligence && <LocalizationIntelligenceDrawer intelligence={intelligence} onClose={() => setDrawerIssue(null)} />}
    </div>
  );
}