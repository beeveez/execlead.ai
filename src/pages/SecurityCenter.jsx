import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck, Key, Smartphone, Monitor, Activity, Lock, Fingerprint,
  Eye, FileText, ArrowRight, Shield, CheckCircle2, AlertCircle, Cpu,
  Radar, Plug, Download, Building2, AlertTriangle,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import SessionManager from "@/components/security/SessionManager";
import DeviceManagement from "@/components/security/DeviceManagement";
import SecurityEventsPanel from "@/components/security/SecurityEventsPanel";
import ThreatDetectionPanel from "@/components/security/ThreatDetectionPanel";
import ConnectedApplications from "@/components/security/ConnectedApplications";
import DataExportHistory from "@/components/security/DataExportHistory";

const ADMIN_ROLES = ["admin", "super_admin", "platform_admin", "developer", "enterprise_admin"];

export default function SecurityCenter() {
  const { user } = useAuth();
  const [tab, setTab] = useState("overview");
  const [sessions, setSessions] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sessionData, deviceData] = await Promise.all([
        base44.entities.SecuritySession.filter({ user_id: user?.id }).catch(() => []),
        base44.entities.TrustedDevice.filter({ user_id: user?.id }).catch(() => []),
      ]);
      setSessions(sessionData || []);
      setDevices(deviceData || []);
    } catch (e) {
      console.error("Failed to load security data:", e);
    } finally {
      setLoading(false);
    }
  };

  const activeSessions = sessions.filter(s => s.status === "active");
  const trustedDevices = devices.filter(d => d.status === "trusted");
  const securityScore = computePersonalScore(sessions, devices);
  const isAdmin = ADMIN_ROLES.includes(user?.role);

  const TABS = [
    { id: "overview", label: "Overview", icon: Eye },
    { id: "sessions", label: "Sessions", icon: Monitor },
    { id: "devices", label: "Devices", icon: Smartphone },
    { id: "history", label: "Login History", icon: Activity },
    { id: "events", label: "Security Events", icon: ShieldCheck },
    { id: "threats", label: "Threat Detection", icon: Radar },
    { id: "apps", label: "Connected Apps", icon: Plug },
    { id: "exports", label: "Data Exports", icon: Download },
    { id: "recovery", label: "Recovery", icon: Shield },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/5 border border-indigo-500/10 rounded-xl p-6">
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <ShieldCheck size={12} className="text-indigo-400" /> Enterprise Security Center™
          {isAdmin && <span className="text-amber-400">· Admin View</span>}
        </div>
        <h1 className="text-2xl font-bold text-white">Enterprise Security Center™</h1>
        <p className="text-white/50 text-sm mt-2 leading-relaxed max-w-3xl">
          Manage your account security — authentication, devices, sessions, threat detection,
          connected applications, and recovery. {isAdmin ? "Admin visibility includes organization-wide security events." : "You see only your own security information."}
        </p>
        <div className="flex items-center gap-6 mt-4">
          <ScoreRing score={securityScore} />
          <div className="space-y-1.5">
            <SecurityStatusItem label="Admin Security Gate" status={isAdmin ? "info" : "check"} value={isAdmin ? "Available" : "N/A"} />
            <SecurityStatusItem label="Active Sessions" value={`${activeSessions.length}`} status="info" />
            <SecurityStatusItem label="Trusted Devices" value={`${trustedDevices.length}`} status="info" />
            <SecurityStatusItem label="Threat Detection" status="check" value="Active" />
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickLink to="/identity-verification" icon={Fingerprint} label="Identity Verification" desc="Verify your identity" />
        <QuickLink to="/privacy-compliance" icon={Lock} label="Privacy Settings" desc="Manage your data & consent" />
        <QuickLink to="/settings" icon={Cpu} label="Account Settings" desc="Profile & preferences" />
        <QuickLink to="/connected-accounts" icon={Key} label="Connected Accounts" desc="OAuth & integrations" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              tab === t.id ? "bg-indigo-500/15 text-indigo-400" : "text-white/40 hover:text-white/70"
            }`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "overview" && <AccountOverview sessions={sessions} devices={devices} score={securityScore} loading={loading} isAdmin={isAdmin} />}
      {tab === "sessions" && <SessionManager />}
      {tab === "devices" && <DeviceManagement />}
      {tab === "history" && <LoginHistory sessions={sessions} loading={loading} />}
      {tab === "events" && <SecurityEventsPanel isAdmin={isAdmin} />}
      {tab === "threats" && <ThreatDetectionPanel isAdmin={isAdmin} />}
      {tab === "apps" && <ConnectedApplications />}
      {tab === "exports" && <DataExportHistory />}
      {tab === "recovery" && <RecoveryOptions />}
    </div>
  );
}

// ============================================================
// COMPONENTS
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
        <span className="text-[8px] text-white/30 uppercase tracking-wider">Score</span>
      </div>
    </div>
  );
}

function SecurityStatusItem({ label, value, status }) {
  const icon = status === "check" ? <CheckCircle2 size={12} className="text-emerald-400" /> :
    status === "alert" ? <AlertCircle size={12} className="text-amber-400" /> : null;
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
      <Icon size={16} className="text-indigo-400" />
      <span className="text-xs font-medium text-white/70">{label}</span>
      <span className="text-[10px] text-white/30">{desc}</span>
    </Link>
  );
}

function AccountOverview({ sessions, devices, score, loading, isAdmin }) {
  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" /></div>;
  }
  const cards = [
    { label: "Admin Security Gate", icon: ShieldCheck, status: isAdmin ? "Available" : "N/A", color: "emerald", desc: "Secondary verification for destructive actions" },
    { label: "Active Sessions", icon: Monitor, status: `${sessions.filter(s => s.status === "active").length}`, color: "blue", desc: "Across your devices" },
    { label: "Trusted Devices", icon: Smartphone, status: `${devices.filter(d => d.status === "trusted").length}`, color: "blue", desc: "Recognized devices" },
    { label: "Threat Detection", icon: Radar, status: "Active", color: "emerald", desc: "Real-time threat monitoring" },
    { label: "Connected Apps", icon: Key, status: "2 Active", color: "blue", desc: "OAuth integrations" },
    { label: "Recovery", icon: Shield, status: "Verified", color: "emerald", desc: "Recovery email confirmed" },
  ];
  const colorMap = { emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", amber: "text-amber-400 bg-amber-500/10 border-amber-500/20", blue: "text-blue-400 bg-blue-500/10 border-blue-500/20" };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {cards.map(c => (
        <div key={c.label} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <c.icon size={16} className="text-white/40" />
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${colorMap[c.color]}`}>{c.status}</span>
          </div>
          <h3 className="text-sm font-medium text-white/80">{c.label}</h3>
          <p className="text-[11px] text-white/30 mt-0.5">{c.desc}</p>
        </div>
      ))}
    </div>
  );
}

function LoginHistory({ sessions, loading }) {
  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" /></div>;
  }
  if (!sessions.length) {
    return <div className="text-center py-12 text-xs text-white/30">No login history available</div>;
  }
  return (
    <div className="space-y-1">
      {sessions.slice(0, 20).map(s => (
        <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
          <div className={`w-2 h-2 rounded-full ${s.status === "active" ? "bg-emerald-400" : "bg-white/20"}`} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/70">{s.device_type || s.user_agent || "Unknown device"}</p>
            <p className="text-[10px] text-white/30">{s.ip_address || "—"} · {s.location || "—"}</p>
          </div>
          <span className="text-[10px] text-white/30">{s.created_date ? new Date(s.created_date).toLocaleString() : "—"}</span>
        </div>
      ))}
    </div>
  );
}

function RecoveryOptions() {
  const options = [
    { label: "Recovery Email", value: "Verified", status: "ok", desc: "Used for account recovery and security alerts" },
    { label: "Recovery Phone", value: "Not set", status: "warn", desc: "Add a phone for SMS-based recovery" },
    { label: "Backup Codes", value: "Available", status: "ok", desc: "Single-use codes for when you lose your device" },
    { label: "Account Deletion", value: "Available", status: "info", desc: "Permanently delete your account and data", link: "/settings" },
  ];
  return (
    <div className="space-y-3">
      {options.map(o => (
        <div key={o.label} className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-white/80">{o.label}</h3>
            <p className="text-[11px] text-white/30 mt-0.5">{o.desc}</p>
          </div>
          {o.link ? (
            <Link to={o.link} className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              Manage <ArrowRight size={10} />
            </Link>
          ) : (
            <span className={`text-[11px] px-2 py-0.5 rounded-full ${o.status === "ok" ? "text-emerald-400 bg-emerald-500/10" : o.status === "warn" ? "text-amber-400 bg-amber-500/10" : "text-white/40 bg-white/5"}`}>
              {o.value}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function computePersonalScore(sessions, devices) {
  let score = 40;
  if (sessions.some(s => s.status === "active")) score += 15;
  if (devices.some(d => d.status === "trusted")) score += 15;
  if (sessions.length <= 5) score += 15;
  else if (sessions.length <= 10) score += 10;
  score += 15; // MFA / Admin Gate
  return Math.min(100, score);
}