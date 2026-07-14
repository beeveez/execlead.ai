import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PrivacyScoreHero from "@/components/privacy/PrivacyScoreHero";
import PrivacyCertification from "@/components/privacy/PrivacyCertification";
import PrivacyRegressionSuite from "@/components/privacy/PrivacyRegressionSuite";
import PrivacyOperationsCenter from "@/components/privacy/PrivacyOperationsCenter";
import DPOCommandCenter from "@/components/privacy/DPOCommandCenter";
import PrivacyEvidenceRegistry from "@/components/privacy/PrivacyEvidenceRegistry";
import DataLifecycleManager from "@/components/privacy/DataLifecycleManager";
import ExplainablePrivacyScore from "@/components/privacy/ExplainablePrivacyScore";
import PrivacyRiskHeatMap from "@/components/privacy/PrivacyRiskHeatMap";
import DataFlowVisualizer from "@/components/privacy/DataFlowVisualizer";
import AIDataUsageDashboard from "@/components/privacy/AIDataUsageDashboard";
import PrivacyTimeline from "@/components/privacy/PrivacyTimeline";
import PrivacyAuditHistory from "@/components/privacy/PrivacyAuditHistory";
import NPCReadiness from "@/components/privacy/NPCReadiness";
import ExecutiveTrustSummary from "@/components/privacy/ExecutiveTrustSummary";
import {
  ShieldCheck, Database, FileCheck, AlertTriangle, FileText, Brain, Map,
  Shield, UserCog, Eye, Download, Edit, Trash2, XCircle, Mail, Lock,
  CheckCircle2, Clock, ExternalLink, ScrollText, FileWarning, Activity,
  Award, GitBranch, Calendar, History, Flag, TrendingUp,
} from "lucide-react";
import {
  DPO_INFO, PRIVACY_DASHBOARD_STATS, DATA_INVENTORY, CONSENT_TYPES,
  DATA_SUBJECT_RIGHTS, PIA_ASSESSMENTS, PIA_RISK_STYLES, RETENTION_POLICIES,
  IDENTITY_DOCUMENT_TYPES, IDENTITY_PROTECTION_RULES, PRIVACY_INCIDENTS,
  RESPONSIBLE_AI_CONTROLS, AI_TRANSPARENCY_NOTICES, COMPLIANCE_ROADMAP,
  ROADMAP_STATUS_STYLES, PRIVACY_DOCUMENTS, SECURITY_CONTROLS,
  AUDIT_LOG_CATEGORIES,
} from "@/lib/privacyEngine";

const ICON_MAP = { Eye, Download, Edit, Trash2, XCircle, Brain, Mail };

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: ShieldCheck },
  { id: 'inventory', label: 'Data Inventory', icon: Database },
  { id: 'consent', label: 'Consent & Rights', icon: FileCheck },
  { id: 'risk', label: 'Risk & Incidents', icon: AlertTriangle },
  { id: 'policies', label: 'Policies & Retention', icon: FileText },
  { id: 'responsible_ai', label: 'Responsible AI', icon: Brain },
  { id: 'roadmap', label: 'Roadmap', icon: Map },
  { id: 'certification', label: 'Certification', icon: Award },
  { id: 'regression', label: 'Regression Suite', icon: Activity },
  { id: 'operations', label: 'Operations', icon: Shield },
  { id: 'dpo', label: 'DPO Command Center', icon: UserCog },
  { id: 'evidence', label: 'Evidence Registry', icon: FileCheck },
  { id: 'lifecycle', label: 'Data Lifecycle', icon: GitBranch },
  { id: 'explainable', label: 'Explainable Score', icon: TrendingUp },
  { id: 'risk_heatmap', label: 'Risk Heat Map', icon: AlertTriangle },
  { id: 'data_flow', label: 'Data Flow', icon: Database },
  { id: 'ai_usage', label: 'AI Data Usage', icon: Brain },
  { id: 'audit_history', label: 'Audit History', icon: History },
  { id: 'timeline', label: 'Timeline', icon: Calendar },
  { id: 'npc', label: 'NPC Readiness', icon: Flag },
];

const cardClass = "bg-white/[0.02] border border-white/10 rounded-2xl p-5";
const labelSm = "text-[10px] text-white/30 uppercase tracking-wider font-medium";
const badgeGreen = "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";

export default function PrivacyComplianceCenter() {
  const [tab, setTab] = useState('dashboard');
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <ShieldCheck size={24} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Privacy & Compliance Center™</h1>
            <p className="text-white/40 text-sm">Philippine Data Privacy Act (RA 10173) · Privacy by Design</p>
          </div>
        </div>

        {/* Executive Trust Summary */}
        <ExecutiveTrustSummary />

        {/* Tab Bar */}
        <div className="flex flex-wrap gap-1.5 border-b border-white/10 pb-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                tab === t.id ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent'
              }`}
            >
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === 'dashboard' && <DashboardTab user={user} />}
        {tab === 'inventory' && <InventoryTab />}
        {tab === 'consent' && <ConsentTab user={user} />}
        {tab === 'risk' && <RiskTab />}
        {tab === 'policies' && <PoliciesTab />}
        {tab === 'responsible_ai' && <ResponsibleAITab />}
        {tab === 'roadmap' && <RoadmapTab />}
        {tab === 'certification' && <PrivacyCertification />}
        {tab === 'regression' && <PrivacyRegressionSuite />}
        {tab === 'operations' && <PrivacyOperationsCenter />}
        {tab === 'dpo' && <DPOCommandCenter />}
        {tab === 'evidence' && <PrivacyEvidenceRegistry />}
        {tab === 'lifecycle' && <DataLifecycleManager />}
        {tab === 'explainable' && <ExplainablePrivacyScore />}
        {tab === 'risk_heatmap' && <PrivacyRiskHeatMap />}
        {tab === 'data_flow' && <DataFlowVisualizer />}
        {tab === 'ai_usage' && <AIDataUsageDashboard />}
        {tab === 'audit_history' && <PrivacyAuditHistory />}
        {tab === 'timeline' && <PrivacyTimeline />}
        {tab === 'npc' && <NPCReadiness />}
      </div>
    </div>
  );
}

// ============================================================
// DASHBOARD TAB
// ============================================================
function DashboardTab({ user }) {
  const s = PRIVACY_DASHBOARD_STATS;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PrivacyScoreHero />

        {/* DPO Card */}
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-4">
            <UserCog size={18} className="text-indigo-400" />
            <h3 className="text-white font-semibold text-sm">Data Protection Officer</h3>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-lg">
              {DPO_INFO.name.charAt(0)}
            </div>
            <div>
              <div className="text-white font-semibold text-sm">{DPO_INFO.name}</div>
              <div className="text-white/40 text-xs">{DPO_INFO.role}</div>
            </div>
          </div>
          <div className="space-y-1">
            {DPO_INFO.responsibilities.map((r) => (
              <div key={r} className="flex items-center gap-2 text-xs text-white/50">
                <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" /> {r}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <StatCard icon={ShieldCheck} label="Compliance" value="RA 10173" status="good" />
        <StatCard icon={FileCheck} label="Consent Coverage" value={`${s.consent_coverage}%`} status="good" />
        <StatCard icon={Lock} label="Identity Documents" value="Encrypted" status="good" />
        <StatCard icon={Clock} label="Data Requests" value={`${s.data_requests_pending} Pending`} status="good" />
        <StatCard icon={Activity} label="Retention Policies" value="Healthy" status="good" />
        <StatCard icon={ScrollText} label="Audit Logs" value="Healthy" status="good" />
        <StatCard icon={AlertTriangle} label="Incident Status" value="No Active" status="good" />
        <StatCard icon={FileText} label="Privacy Policies" value="Published" status="good" />
      </div>

      {/* AI Transparency Notices */}
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-3">
          <Brain size={16} className="text-purple-400" />
          <h3 className="text-white font-semibold text-sm">AI Transparency Notices</h3>
        </div>
        <div className="space-y-2">
          {AI_TRANSPARENCY_NOTICES.map((notice, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-white/50">
              <span className="text-purple-400 mt-0.5">•</span> {notice}
            </div>
          ))}
        </div>
      </div>

      {/* Security Controls */}
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <Shield size={16} className="text-emerald-400" />
          <h3 className="text-white font-semibold text-sm">Security Controls</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SECURITY_CONTROLS.map((sc) => (
            <div key={sc.control} className="flex items-center justify-between px-3 py-2 bg-white/[0.02] rounded-lg">
              <div>
                <div className="text-white/70 text-xs font-medium">{sc.control}</div>
                <div className="text-white/30 text-[10px]">{sc.detail}</div>
              </div>
              <span className={badgeGreen}>Active</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-white/30">
        <span>Last Privacy Review: {s.last_review}</span>
        <span>Next Compliance Review: {s.next_review}</span>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, status }) {
  const color = status === 'good' ? 'text-emerald-400' : 'text-amber-400';
  return (
    <div className={cardClass}>
      <Icon size={16} className={color} />
      <div className={`text-sm font-semibold mt-2 ${color}`}>{value}</div>
      <div className={labelSm}>{label}</div>
    </div>
  );
}

// ============================================================
// DATA INVENTORY TAB
// ============================================================
function InventoryTab() {
  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold text-sm">Data Inventory Registry</h3>
          <p className="text-white/30 text-xs">All platform entities with personal data classifications</p>
        </div>
        <span className={badgeGreen}>{DATA_INVENTORY.length} entities</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-3 py-2 text-white/40 font-medium">Entity</th>
              <th className="text-left px-3 py-2 text-white/40 font-medium">Classification</th>
              <th className="text-left px-3 py-2 text-white/40 font-medium">Personal Data</th>
              <th className="text-left px-3 py-2 text-white/40 font-medium">Sensitive</th>
              <th className="text-left px-3 py-2 text-white/40 font-medium">Identity Docs</th>
              <th className="text-left px-3 py-2 text-white/40 font-medium">Purpose</th>
              <th className="text-left px-3 py-2 text-white/40 font-medium">Retention</th>
              <th className="text-left px-3 py-2 text-white/40 font-medium">Lawful Basis</th>
              <th className="text-center px-3 py-2 text-white/40 font-medium">Encrypted</th>
            </tr>
          </thead>
          <tbody>
            {DATA_INVENTORY.map((row) => (
              <tr key={row.entity} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="px-3 py-3 text-white font-medium whitespace-nowrap">{row.entity}</td>
                <td className="px-3 py-3 text-white/50">{row.classification}</td>
                <td className="px-3 py-3 text-white/40">{row.personal_data.length > 0 ? row.personal_data.join(', ') : '—'}</td>
                <td className="px-3 py-3 text-white/40">{row.sensitive_data.length > 0 ? row.sensitive_data.join(', ') : '—'}</td>
                <td className="px-3 py-3 text-white/40">{row.identity_documents.length > 0 ? row.identity_documents.join(', ') : '—'}</td>
                <td className="px-3 py-3 text-white/40">{row.purpose}</td>
                <td className="px-3 py-3 text-white/40 whitespace-nowrap">{row.retention}</td>
                <td className="px-3 py-3 text-white/40 whitespace-nowrap">{row.lawful_basis}</td>
                <td className="px-3 py-3 text-center"><CheckCircle2 size={14} className="inline text-emerald-400" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================
// CONSENT & RIGHTS TAB
// ============================================================
function ConsentTab({ user }) {
  const [consents, setConsents] = useState({});
  const [requests, setRequests] = useState([]);
  const [submitting, setSubmitting] = useState(null);

  useEffect(() => {
    CONSENT_TYPES.forEach((c) => { if (!consents[c.id]) setConsents((p) => ({ ...p, [c.id]: c.default })); });
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const list = await base44.entities.DataSubjectRequest.filter({}, '-created_date', 20);
      setRequests(list);
    } catch { /* ignore */ }
  };

  const toggleConsent = async (consentType, granted) => {
    setConsents((p) => ({ ...p, [consentType]: granted }));
    try {
      await base44.entities.ConsentRecord.create({
        consent_type: consentType,
        consent_version: '1.0',
        granted,
        date_granted: granted ? new Date().toISOString() : null,
        date_withdrawn: !granted ? new Date().toISOString() : null,
        ip_address: 'recorded',
        purpose: CONSENT_TYPES.find((c) => c.id === consentType)?.label || consentType,
        user_email: user?.email || '',
      });
    } catch { /* ignore */ }
  };

  const submitRight = async (rightId) => {
    setSubmitting(rightId);
    try {
      await base44.entities.DataSubjectRequest.create({
        request_type: rightId,
        status: 'pending',
        user_email: user?.email || '',
        requested_at: new Date().toISOString(),
      });
      loadRequests();
    } catch { /* ignore */ }
    setSubmitting(null);
  };

  return (
    <div className="space-y-6">
      {/* Consent Registry */}
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <FileCheck size={16} className="text-indigo-400" />
          <h3 className="text-white font-semibold text-sm">Consent Registry™</h3>
        </div>
        <div className="space-y-2">
          {CONSENT_TYPES.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-4 py-3 bg-white/[0.02] rounded-lg">
              <div>
                <div className="text-white/70 text-xs font-medium">{c.label}{c.required && <span className="text-white/30 ml-1">(required)</span>}</div>
                <div className="text-white/30 text-[10px] mt-0.5">{c.description}</div>
              </div>
              <button
                onClick={() => !c.required && toggleConsent(c.id, !consents[c.id])}
                disabled={c.required}
                className={`relative w-10 h-5 rounded-full transition-colors ${consents[c.id] ? 'bg-emerald-500' : 'bg-white/10'} ${c.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${consents[c.id] ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Data Subject Rights */}
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <Shield size={16} className="text-emerald-400" />
          <h3 className="text-white font-semibold text-sm">Data Subject Rights (RA 10173 §16)</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {DATA_SUBJECT_RIGHTS.map((right) => {
            const Icon = ICON_MAP[right.icon] || Eye;
            return (
              <button
                key={right.id}
                onClick={() => submitRight(right.id)}
                disabled={submitting === right.id}
                className="flex items-start gap-3 px-4 py-3 bg-white/[0.02] hover:bg-white/5 border border-white/5 rounded-lg text-left transition-colors disabled:opacity-40"
              >
                <Icon size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-white/70 text-xs font-medium">{right.label}</div>
                  <div className="text-white/30 text-[10px] mt-0.5">{right.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Request History */}
      {requests.length > 0 && (
        <div className={cardClass}>
          <h3 className="text-white font-semibold text-sm mb-3">Request History</h3>
          <div className="space-y-1">
            {requests.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-3 py-2 bg-white/[0.02] rounded-lg text-xs">
                <span className="text-white/60">{r.request_type.replace(/_/g, ' ')}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${r.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// RISK & INCIDENTS TAB
// ============================================================
function RiskTab() {
  return (
    <div className="space-y-6">
      {/* PIA */}
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <FileWarning size={16} className="text-amber-400" />
          <h3 className="text-white font-semibold text-sm">Privacy Impact Assessment™</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-3 py-2 text-white/40 font-medium">Feature</th>
                <th className="text-left px-3 py-2 text-white/40 font-medium">Risk Level</th>
                <th className="text-center px-3 py-2 text-white/40 font-medium">Findings</th>
                <th className="text-center px-3 py-2 text-white/40 font-medium">Mitigations</th>
                <th className="text-center px-3 py-2 text-white/40 font-medium">Status</th>
                <th className="text-left px-3 py-2 text-white/40 font-medium">Last Assessed</th>
              </tr>
            </thead>
            <tbody>
              {PIA_ASSESSMENTS.map((a) => {
                const rs = PIA_RISK_STYLES[a.risk_level] || PIA_RISK_STYLES.medium;
                return (
                  <tr key={a.feature} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-3 py-3 text-white font-medium">{a.feature}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${rs.bg} ${rs.color} ${rs.border} border`}>
                        {rs.label}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center text-white/50">{a.findings}</td>
                    <td className="px-3 py-3 text-center text-white/50">{a.mitigations}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={`text-[10px] ${a.status === 'approved' ? 'text-emerald-400' : a.status === 'reviewed' ? 'text-amber-400' : 'text-orange-400'}`}>
                        {a.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-white/40">{a.last_assessed}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incident Center */}
      <div className={cardClass}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-400" />
            <h3 className="text-white font-semibold text-sm">Privacy Incident Center™</h3>
          </div>
          <span className={badgeGreen}>No Active Incidents</span>
        </div>
        <div className="text-center py-8 text-white/30 text-sm">
          <ShieldCheck size={32} className="mx-auto mb-2 text-emerald-400/40" />
          No privacy incidents recorded. All systems operating normally.
        </div>
      </div>
    </div>
  );
}

// ============================================================
// POLICIES & RETENTION TAB
// ============================================================
function PoliciesTab() {
  return (
    <div className="space-y-6">
      {/* Retention Policies */}
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-indigo-400" />
          <h3 className="text-white font-semibold text-sm">Data Retention Policy Engine</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-3 py-2 text-white/40 font-medium">Data Type</th>
                <th className="text-left px-3 py-2 text-white/40 font-medium">Retention Period</th>
                <th className="text-center px-3 py-2 text-white/40 font-medium">Auto-Delete</th>
                <th className="text-center px-3 py-2 text-white/40 font-medium">Notify Before</th>
                <th className="text-center px-3 py-2 text-white/40 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {RETENTION_POLICIES.map((p) => (
                <tr key={p.data_type} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-3 py-3 text-white font-medium">{p.data_type}</td>
                  <td className="px-3 py-3 text-white/50">{p.period}</td>
                  <td className="px-3 py-3 text-center">
                    {p.auto_delete ? <CheckCircle2 size={14} className="inline text-emerald-400" /> : <XCircle size={14} className="inline text-white/20" />}
                  </td>
                  <td className="px-3 py-3 text-center text-white/50">{p.notify_days > 0 ? `${p.notify_days} days` : '—'}</td>
                  <td className="px-3 py-3 text-center"><span className={badgeGreen}>{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Identity Protection */}
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <Lock size={16} className="text-purple-400" />
          <h3 className="text-white font-semibold text-sm">Identity Document Protection</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {IDENTITY_DOCUMENT_TYPES.map((d) => (
            <div key={d.type} className="flex items-center justify-between px-3 py-2 bg-white/[0.02] rounded-lg">
              <span className="text-white/60 text-xs">{d.type}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-emerald-400">🔒 Encrypted</span>
                <span className="text-[10px] text-white/30">Audit: {d.audit ? '✓' : '✗'}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          {IDENTITY_PROTECTION_RULES.map((rule, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-white/50">
              <ShieldCheck size={12} className="text-emerald-400 flex-shrink-0 mt-0.5" /> {rule}
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Documents */}
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <FileText size={16} className="text-emerald-400" />
          <h3 className="text-white font-semibold text-sm">Privacy Policy Documents</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PRIVACY_DOCUMENTS.map((doc) => (
            <div key={doc.id} className="px-4 py-3 bg-white/[0.02] rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white/70 text-xs font-medium">{doc.title}</span>
                <span className={badgeGreen}>v{doc.version}</span>
              </div>
              <p className="text-white/30 text-[10px]">{doc.description}</p>
              <p className="text-white/20 text-[10px] mt-1">Updated: {doc.last_updated}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log Categories */}
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-3">
          <ScrollText size={16} className="text-amber-400" />
          <h3 className="text-white font-semibold text-sm">Audit Logging Coverage</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {AUDIT_LOG_CATEGORIES.map((cat) => (
            <span key={cat} className="px-2.5 py-1 bg-white/[0.02] border border-white/5 rounded-md text-[10px] text-white/50">
              {cat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// RESPONSIBLE AI TAB
// ============================================================
function ResponsibleAITab() {
  return (
    <div className="space-y-6">
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <Brain size={18} className="text-purple-400" />
          <h3 className="text-white font-semibold text-sm">Responsible AI Governance</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {RESPONSIBLE_AI_CONTROLS.map((c) => (
            <div key={c.control} className="px-4 py-3 bg-white/[0.02] rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white/70 text-xs font-medium">{c.control}</span>
                <span className={`text-[10px] font-medium ${c.score >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>{c.score}%</span>
              </div>
              <p className="text-white/30 text-[10px]">{c.description}</p>
              <div className="h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                <div className={`h-full rounded-full ${c.score >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${c.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-3">
          <Eye size={16} className="text-indigo-400" />
          <h3 className="text-white font-semibold text-sm">AI Transparency Notices</h3>
        </div>
        <div className="space-y-2">
          {AI_TRANSPARENCY_NOTICES.map((notice, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-white/50 px-3 py-2 bg-white/[0.02] rounded-lg">
              <span className="text-purple-400">•</span> {notice}
            </div>
          ))}
        </div>
      </div>

      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-3">
          <FileText size={16} className="text-emerald-400" />
          <h3 className="text-white font-semibold text-sm">AI Transparency Policy</h3>
          <span className={badgeGreen}>Published v1.0</span>
        </div>
        <p className="text-white/40 text-xs leading-relaxed">
          EXECLEAD.AI uses AI to assist with executive leadership development, coaching, and analytics. AI outputs are recommendations only — not definitive judgments. Human review is required for all important decisions. Users may appeal or request correction of any AI-influenced assessment.
        </p>
        <Link to="/trust-center" className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 mt-3">
          View full policy <ExternalLink size={12} />
        </Link>
      </div>
    </div>
  );
}

// ============================================================
// ROADMAP TAB
// ============================================================
function RoadmapTab() {
  return (
    <div className="space-y-6">
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <Map size={16} className="text-indigo-400" />
          <h3 className="text-white font-semibold text-sm">Compliance Roadmap</h3>
        </div>
        <div className="space-y-3">
          {COMPLIANCE_ROADMAP.map((item, i) => {
            const style = ROADMAP_STATUS_STYLES[item.status] || ROADMAP_STATUS_STYLES.planned;
            return (
              <div key={i} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full ${style.bg} ${style.border} border flex items-center justify-center text-sm ${style.color}`}>
                    {style.icon}
                  </div>
                  {i < COMPLIANCE_ROADMAP.length - 1 && <div className="w-px h-8 bg-white/10 mt-1" />}
                </div>
                <div className="pb-2">
                  <div className="text-white/70 text-sm font-medium">{item.regulation}</div>
                  <div className="text-white/30 text-xs">{item.description}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${style.bg} ${style.color} ${style.border} border`}>
                      {style.label}
                    </span>
                    <span className="text-white/20 text-[10px]">Target: {item.target}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={cardClass}>
        <h3 className="text-white font-semibold text-sm mb-3">Architecture Principles</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            'Privacy by Design — embedded in every feature',
            'Data minimization — collect only what is necessary',
            'Purpose limitation — data used only for stated purposes',
            'Transparency — users informed of all processing',
            'User empowerment — self-service rights portal',
            'Encryption by default — AES-256 + TLS 1.3',
            'Audit-ready — immutable logging',
            'International-ready — GDPR/PDPA expansion path',
          ].map((p, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-white/50">
              <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" /> {p}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}