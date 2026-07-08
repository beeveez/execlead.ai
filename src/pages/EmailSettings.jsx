import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { clearEmailSettingsCache } from "@/lib/emailProvider";
import {
  Mail, Settings, Send, Inbox, FileText, Loader2, ShieldCheck,
  LayoutDashboard, ScrollText, Activity,
} from "lucide-react";
import NotConfiguredBanner from "@/components/email/NotConfiguredBanner";
import ProviderConfigForm from "@/components/email/ProviderConfigForm";
import TestConnectionPanel from "@/components/email/TestConnectionPanel";
import EmailQueueStats from "@/components/email/EmailQueueStats";
import EmailLogsTable from "@/components/email/EmailLogsTable";
import EmailDashboard from "@/components/email/EmailDashboard";
import ProviderStatusCard from "@/components/email/ProviderStatusCard";
import DiagnosticsPanel from "@/components/email/DiagnosticsPanel";
import TemplatesPanel from "@/components/email/TemplatesPanel";
import HistoricalLogsBanner from "@/components/email/HistoricalLogsBanner";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "settings", label: "Provider Settings", icon: Settings },
  { id: "templates", label: "Templates", icon: FileText },
  { id: "queue", label: "Queue", icon: Inbox },
  { id: "logs", label: "Delivery Logs", icon: ScrollText },
  { id: "diagnostics", label: "Diagnostics", icon: Activity },
  { id: "test", label: "Test Connection", icon: Send },
];

export default function EmailSettings() {
  const [settings, setSettings] = useState(null);
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const configRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        base44.auth.me().then(setUser).catch(() => {});
        const list = await base44.entities.EmailSettings.list();
        setSettings(list[0] || { provider: "resend", from_email: "", from_name: "EXECLEAD.AI", is_active: true, connection_status: "untested", domain_verification_status: "not_started" });
        const evts = await base44.entities.EmailEvent.list("-created_date", 500);
        setEvents(evts);
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  // Realtime subscription for live queue counts
  useEffect(() => {
    const unsubscribe = base44.entities.EmailEvent.subscribe((event) => {
      setEvents(prev => {
        if (event.type === "create") return [event.data, ...prev].slice(0, 500);
        if (event.type === "update") return prev.map(e => e.id === event.data.id ? { ...e, ...event.data } : e);
        if (event.type === "delete") return prev.filter(e => e.id !== event.data.id);
        return prev;
      });
    });
    return unsubscribe;
  }, []);

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (settings.id) {
        const updated = await base44.entities.EmailSettings.update(settings.id, payload);
        setSettings(updated);
      } else {
        const created = await base44.entities.EmailSettings.create(payload);
        setSettings(created);
      }
      clearEmailSettingsCache();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {}
    setSaving(false);
  };

  const reloadData = async () => {
    try {
      const list = await base44.entities.EmailSettings.list();
      if (list[0]) setSettings(prev => ({ ...prev, ...list[0] }));
      const evts = await base44.entities.EmailEvent.list("-created_date", 500);
      setEvents(evts);
    } catch (e) {}
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;

  const notConfigured = !settings?.is_active || !settings?.from_email;
  const historicalCount = events.filter(e => e.delivery_status === "not_configured" || e.provider === "none" || e.provider === "").length;
  const deliveredEvents = events.filter(e => ["delivered", "sent"].includes(e.delivery_status));
  const lastSuccessful = deliveredEvents.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Mail size={12} className="text-indigo-400" /> Email Infrastructure
          <span className="inline-flex items-center gap-1 text-emerald-400/60 ml-2"><ShieldCheck size={11} /> Super Admin Only</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Email Operations Center</h1>
        <p className="text-white/40 text-sm mt-1">Enterprise-grade email delivery monitoring — provider configuration, diagnostics, queue management, delivery logs, and retries.</p>
      </div>

      {/* Provider Status Card — always visible */}
      <ProviderStatusCard settings={settings} lastSuccessful={lastSuccessful} />

      {notConfigured && (
        <NotConfiguredBanner
          onConfigure={() => {
            setTab("settings");
            setTimeout(() => configRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
          }}
        />
      )}

      {/* Historical logs banner */}
      {historicalCount > 0 && <HistoricalLogsBanner historicalCount={historicalCount} />}

      {/* Tab Navigation */}
      <div ref={configRef} className="flex items-center gap-1 border-b border-white/5 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tab === t.id ? "border-indigo-500 text-white" : "border-transparent text-white/40 hover:text-white/70"}`}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "dashboard" && <EmailDashboard settings={settings} events={events} />}
      {tab === "settings" && <ProviderConfigForm settings={settings} onSave={handleSave} saving={saving} saved={saved} />}
      {tab === "templates" && <TemplatesPanel />}
      {tab === "queue" && <EmailQueueStats events={events} />}
      {tab === "logs" && <EmailLogsTable events={events} settings={settings} onReload={reloadData} />}
      {tab === "diagnostics" && <DiagnosticsPanel settings={settings} />}
      {tab === "test" && <TestConnectionPanel settings={settings} userEmail={user?.email} onTested={reloadData} />}
    </div>
  );
}