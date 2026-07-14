import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import {
  ShieldCheck, Download, Trash2, Mail, Brain, Cookie, Clock, FileText,
  CheckCircle2, AlertCircle, ArrowRight, Lock, Activity, Eye, UserCog,
  TrendingUp, Bell, Database,
} from "lucide-react";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: Eye },
  { id: "consent", label: "Consent & Preferences", icon: CheckCircle2 },
  { id: "data", label: "My Data", icon: Database },
  { id: "rights", label: "My Rights", icon: FileText },
  { id: "timeline", label: "Timeline", icon: Activity },
];

export default function MyPrivacy() {
  const { user } = useAuth();
  const [tab, setTab] = useState("dashboard");
  const [consents, setConsents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [consentData, requestData] = await Promise.all([
        base44.entities.ConsentRecord.filter({ user_email: user?.email }).catch(() => []),
        base44.entities.DataSubjectRequest.filter({ user_email: user?.email }).catch(() => []),
      ]);
      setConsents(consentData || []);
      setRequests(requestData || []);
    } catch (e) {
      console.error("Failed to load privacy data:", e);
    } finally {
      setLoading(false);
    }
  };

  const score = computePersonalPrivacyScore(consents);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/10 rounded-xl p-6">
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <ShieldCheck size={12} className="text-emerald-400" /> My Privacy & Compliance™ · My Account
        </div>
        <h1 className="text-2xl font-bold text-white">My Privacy & Compliance™</h1>
        <p className="text-white/50 text-sm mt-2 leading-relaxed max-w-3xl">
          Manage your personal privacy, consent, data rights, and preferences.
          This page manages only your account — not organization or platform compliance.
        </p>
        <div className="flex items-center gap-6 mt-4">
          <ScoreRing score={score} />
          <div className="space-y-1.5">
            <StatusItem label="Marketing" granted={consents.some(c => c.consent_type === "marketing" && c.granted)} />
            <StatusItem label="Analytics" granted={consents.some(c => c.consent_type === "analytics" && c.granted)} />
            <StatusItem label="AI Personalization" granted={consents.some(c => c.consent_type === "ai_personalization" && c.granted)} />
            <StatusItem label="Privacy Requests" value={`${requests.length}`} />
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickLink to="/security" icon={Lock} label="Account Security™" desc="MFA, sessions, devices" />
        <QuickLink to="/settings" icon={UserCog} label="Account Settings" desc="Profile & preferences" />
        <QuickLink to="/connected-accounts" icon={Database} label="Connected Accounts" desc="OAuth & integrations" />
        <QuickLink to="/security" icon={Trash2} label="Delete My Account" desc="Permanently remove data" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              tab === t.id ? "bg-emerald-500/15 text-emerald-400" : "text-white/40 hover:text-white/70"
            }`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "dashboard" && <DashboardTab consents={consents} requests={requests} score={score} loading={loading} />}
      {tab === "consent" && <ConsentTab consents={consents} loading={loading} />}
      {tab === "data" && <DataTab requests={requests} loading={loading} />}
      {tab === "rights" && <RightsTab requests={requests} loading={loading} />}
      {tab === "timeline" && <TimelineTab consents={consents} requests={requests} loading={loading} />}
    </div>
  );
}

// ============================================================
// TABS
// ============================================================

function DashboardTab({ consents, requests, score, loading }) {
  if (loading) return <Spinner />;
  const cards = [
    { label: "Marketing", icon: Mail, granted: consents.some(c => c.consent_type === "marketing" && c.granted) },
    { label: "Analytics", icon: TrendingUp, granted: consents.some(c => c.consent_type === "analytics" && c.granted) },
    { label: "AI Personalization", icon: Brain, granted: consents.some(c => c.consent_type === "ai_personalization" && c.granted) },
    { label: "Cookies", icon: Cookie, granted: consents.some(c => c.consent_type === "cookies" && c.granted) },
    { label: "Privacy Requests", icon: FileText, value: `${requests.length}` },
    { label: "Completed Requests", icon: CheckCircle2, value: `${requests.filter(r => r.status === "completed").length}` },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {cards.map(c => (
        <div key={c.label} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <c.icon size={16} className="text-white/40" />
            {c.value !== undefined ? (
              <span className="text-sm font-bold text-white/70">{c.value}</span>
            ) : c.granted ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">Granted</span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full text-white/40 bg-white/5">Not granted</span>
            )}
          </div>
          <h3 className="text-sm font-medium text-white/80">{c.label}</h3>
        </div>
      ))}
    </div>
  );
}

function ConsentTab({ consents, loading }) {
  if (loading) return <Spinner />;
  const types = [
    { type: "marketing", label: "Marketing Emails", icon: Mail, desc: "Receive product updates, newsletters, and promotional content" },
    { type: "ai_personalization", label: "AI Personalization", icon: Brain, desc: "Allow AI to use your data for personalized recommendations" },
    { type: "analytics", label: "Analytics", icon: TrendingUp, desc: "Help improve the platform through anonymous usage analytics" },
    { type: "cookies", label: "Cookie Preferences", icon: Cookie, desc: "Store cookies for session management and preferences" },
  ];
  return (
    <div className="space-y-3">
      {types.map(t => {
        const record = consents.find(c => c.consent_type === t.type);
        const granted = record?.granted || false;
        return (
          <div key={t.type} className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <t.icon size={16} className="text-white/40 shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-white/80">{t.label}</h3>
              <p className="text-[11px] text-white/30 mt-0.5">{t.desc}</p>
            </div>
            <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${granted ? "text-emerald-400 bg-emerald-500/10" : "text-white/40 bg-white/5"}`}>
              {granted ? "Granted" : "Not granted"}
            </span>
          </div>
        );
      })}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <h3 className="text-sm font-medium text-white/80 mb-1">Privacy Policy & Terms</h3>
        <p className="text-[11px] text-white/30 mb-2">Review the documents that govern how your data is handled.</p>
        <div className="flex gap-2">
          <Link to="/legal" className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
            <FileText size={12} /> Privacy Policy <ArrowRight size={10} />
          </Link>
          <Link to="/legal" className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
            <FileText size={12} /> Terms of Service <ArrowRight size={10} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function DataTab({ requests, loading }) {
  if (loading) return <Spinner />;
  const dataItems = [
    { label: "Download My Data", desc: "Export all data associated with your account", icon: Download, action: "download" },
    { label: "Data Processing Summary", desc: "See how your data is processed and by whom", icon: Eye, action: "summary" },
    { label: "Data Retention", desc: "Understand how long your data is kept", icon: Clock, action: "retention" },
    { label: "Delete My Account", desc: "Permanently delete your account and all data", icon: Trash2, action: "delete" },
  ];
  return (
    <div className="space-y-3">
      {dataItems.map(item => (
        <div key={item.label} className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <item.icon size={16} className="text-white/40 shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-white/80">{item.label}</h3>
            <p className="text-[11px] text-white/30 mt-0.5">{item.desc}</p>
          </div>
          {item.action === "delete" ? (
            <Link to="/settings" className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1">
              Proceed <ArrowRight size={10} />
            </Link>
          ) : (
            <span className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer">
              Request <ArrowRight size={10} />
            </span>
          )}
        </div>
      ))}
      {requests.filter(r => r.request_type === "download_data" || r.request_type === "view_data").length > 0 && (
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <h3 className="text-[11px] text-white/40 uppercase tracking-wider mb-2">Recent Data Requests</h3>
          {requests.filter(r => r.request_type === "download_data" || r.request_type === "view_data").slice(0, 5).map(r => (
            <div key={r.id} className="flex items-center gap-2 text-xs py-1">
              <span className={`w-2 h-2 rounded-full ${r.status === "completed" ? "bg-emerald-400" : "bg-amber-400"}`} />
              <span className="text-white/60">{r.request_type.replace(/_/g, " ")}</span>
              <span className="text-white/30 ml-auto">{r.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RightsTab({ requests, loading }) {
  if (loading) return <Spinner />;
  const rights = [
    { type: "view_data", label: "Right to View", desc: "Access all personal data we hold about you", icon: Eye },
    { type: "download_data", label: "Right to Download", desc: "Receive a copy of your personal data", icon: Download },
    { type: "correct_data", label: "Right to Correct", desc: "Request correction of inaccurate data", icon: FileText },
    { type: "delete_account", label: "Right to Erasure", desc: "Request deletion of your personal data", icon: Trash2 },
    { type: "withdraw_consent", label: "Withdraw Consent", desc: "Withdraw previously granted consent", icon: CheckCircle2 },
    { type: "manage_personalization", label: "Manage Personalization", desc: "Control AI personalization settings", icon: Brain },
    { type: "manage_marketing", label: "Manage Marketing", desc: "Control marketing communications", icon: Mail },
  ];
  return (
    <div className="space-y-3">
      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck size={14} className="text-emerald-400" />
          <h3 className="text-sm font-medium text-white/80">Your Data Subject Rights</h3>
        </div>
        <p className="text-[11px] text-white/30">Under the Philippine Data Privacy Act (RA 10173), you have the following rights regarding your personal data.</p>
      </div>
      {rights.map(r => (
        <div key={r.type} className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <r.icon size={16} className="text-white/40 shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-white/80">{r.label}</h3>
            <p className="text-[11px] text-white/30 mt-0.5">{r.desc}</p>
          </div>
          <span className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer">
            Exercise <ArrowRight size={10} />
          </span>
        </div>
      ))}
      {requests.length > 0 && (
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <h3 className="text-[11px] text-white/40 uppercase tracking-wider mb-2">Your Privacy Requests</h3>
          {requests.slice(0, 10).map(r => (
            <div key={r.id} className="flex items-center gap-2 text-xs py-1">
              <span className={`w-2 h-2 rounded-full ${r.status === "completed" ? "bg-emerald-400" : r.status === "denied" ? "bg-red-400" : "bg-amber-400"}`} />
              <span className="text-white/60">{r.request_type.replace(/_/g, " ")}</span>
              <span className="text-white/30 ml-auto">{r.status}</span>
              <span className="text-white/20">{r.requested_at ? new Date(r.requested_at).toLocaleDateString() : ""}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TimelineTab({ consents, requests, loading }) {
  if (loading) return <Spinner />;
  const events = [
    ...consents.map(c => ({ type: "consent", label: `${c.consent_type.replace(/_/g, " ")} ${c.granted ? "granted" : "withdrawn"}`, date: c.date_granted || c.date_withdrawn || c.created_date })),
    ...requests.map(r => ({ type: "request", label: `${r.request_type.replace(/_/g, " ")} — ${r.status}`, date: r.requested_at || r.created_date })),
  ].filter(e => e.date).sort((a, b) => new Date(b.date) - new Date(a.date));

  if (events.length === 0) {
    return <div className="text-center py-12 text-xs text-white/30">No privacy events yet</div>;
  }
  return (
    <div className="space-y-1">
      {events.slice(0, 20).map((e, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
          <div className={`w-2 h-2 rounded-full ${e.type === "consent" ? "bg-emerald-400" : "bg-blue-400"}`} />
          <span className="text-xs text-white/60">{e.label}</span>
          <span className="text-[10px] text-white/30 ml-auto">{new Date(e.date).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// HELPERS
// ============================================================

function ScoreRing({ score }) {
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative w-20 h-20 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
        <circle cx="32" cy="32" r="28" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-500" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-white">{score}</span>
        <span className="text-[8px] text-white/30 uppercase tracking-wider">Privacy</span>
      </div>
    </div>
  );
}

function StatusItem({ label, value, granted }) {
  const icon = granted !== undefined ? (
    granted ? <CheckCircle2 size={12} className="text-emerald-400" /> : <AlertCircle size={12} className="text-white/30" />
  ) : null;
  return (
    <div className="flex items-center gap-2 text-xs">
      {icon}
      <span className="text-white/40">{label}</span>
      {value && <span className="text-white/70 font-medium ml-auto">{value}</span>}
    </div>
  );
}

function QuickLink({ to, icon: Icon, label, desc }) {
  return (
    <Link to={to} className="group flex flex-col gap-1 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/5 transition-colors">
      <Icon size={16} className="text-emerald-400" />
      <span className="text-xs font-medium text-white/70">{label}</span>
      <span className="text-[10px] text-white/30">{desc}</span>
    </Link>
  );
}

function Spinner() {
  return <div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" /></div>;
}

function computePersonalPrivacyScore(consents) {
  let score = 40;
  if (consents.length > 0) score += 20;
  if (consents.some(c => c.consent_type === "marketing")) score += 10;
  if (consents.some(c => c.consent_type === "ai_personalization")) score += 10;
  if (consents.some(c => c.consent_type === "analytics")) score += 10;
  score += 10;
  return Math.min(100, score);
}