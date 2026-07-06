import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { EMAIL_PROVIDERS, clearEmailSettingsCache } from "@/lib/emailProvider";
import { Mail, Save, Loader2, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";

const STATUS_ICONS = {
  sent: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  failed: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" },
  not_configured: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10" },
};

export default function EmailSettings() {
  const [settings, setSettings] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await base44.entities.EmailSettings.list();
        setSettings(list[0] || { provider: "resend", from_email: "", from_name: "EXECLEAD.AI", is_active: true });
        const evts = await base44.entities.EmailEvent.list("-created_date", 50);
        setEvents(evts);
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (settings.id) {
        await base44.entities.EmailSettings.update(settings.id, settings);
      } else {
        const created = await base44.entities.EmailSettings.create(settings);
        setSettings(created);
      }
      clearEmailSettingsCache();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {}
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2"><Mail size={12} className="text-indigo-400" /> Email Infrastructure</div>
        <h1 className="text-2xl font-bold text-white">Email Settings</h1>
        <p className="text-white/40 text-sm mt-1">Configure the transactional email provider for proposal notifications and system alerts</p>
      </div>

      {!settings?.is_active && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle size={20} className="text-amber-400 flex-shrink-0" />
          <div>
            <div className="text-amber-400 font-medium text-sm">Email provider not configured</div>
            <div className="text-white/40 text-xs mt-0.5">No emails will be sent until a provider is activated. Proposals will still be saved, but no confirmation emails will be sent.</div>
          </div>
        </div>
      )}

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Provider Configuration</h3>

        <div>
          <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Email Provider</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {Object.values(EMAIL_PROVIDERS).map(p => (
              <button key={p.id} onClick={() => setSettings(s => ({ ...s, provider: p.id }))}
                className={`p-4 rounded-lg text-left transition-all ${settings?.provider === p.id ? "bg-indigo-500/15 ring-1 ring-indigo-500/30" : "bg-white/5 hover:bg-white/10"}`}>
                <div className="text-white font-semibold text-sm">{p.name}</div>
                <div className="text-white/30 text-xs mt-1">{p.description}</div>
                {p.id === "resend" && <div className="text-indigo-400 text-xs mt-1">Preferred</div>}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">From Email</label>
            <input value={settings?.from_email || ""} onChange={e => setSettings(s => ({ ...s, from_email: e.target.value }))} placeholder="noreply@execlead.ai" className={inputClass} />
          </div>
          <div>
            <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">From Name</label>
            <input value={settings?.from_name || ""} onChange={e => setSettings(s => ({ ...s, from_name: e.target.value }))} placeholder="EXECLEAD.AI" className={inputClass} />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={settings?.is_active ?? true} onChange={e => setSettings(s => ({ ...s, is_active: e.target.checked }))} className="w-4 h-4 rounded bg-white/5 border-white/20 text-indigo-500" />
          <span className="text-sm text-white/60">Active — enable transactional email sending</span>
        </label>

        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white rounded-lg text-sm font-medium transition-colors">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Settings
          </button>
          {saved && <span className="text-emerald-400 text-sm flex items-center gap-1"><CheckCircle size={14} /> Saved</span>}
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">Email Delivery Log</h3>
        {events.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-8">No email events yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr>
                <th className="text-left px-3 py-2 text-xs text-white/40 uppercase">Recipient</th>
                <th className="text-left px-3 py-2 text-xs text-white/40 uppercase">Subject</th>
                <th className="text-left px-3 py-2 text-xs text-white/40 uppercase">Status</th>
                <th className="text-left px-3 py-2 text-xs text-white/40 uppercase">Timestamp</th>
                <th className="text-left px-3 py-2 text-xs text-white/40 uppercase">Error</th>
              </tr></thead>
              <tbody>
                {events.map(evt => {
                  const si = STATUS_ICONS[evt.delivery_status] || STATUS_ICONS.failed;
                  return (
                    <tr key={evt.id} className="border-t border-white/5">
                      <td className="px-3 py-2 text-white/60">{evt.recipient}</td>
                      <td className="px-3 py-2 text-white/50 max-w-xs truncate">{evt.subject}</td>
                      <td className="px-3 py-2"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${si.bg} ${si.color}`}><si.icon size={10} /> {evt.delivery_status.replace("_", " ")}</span></td>
                      <td className="px-3 py-2 text-white/30 text-xs">{new Date(evt.created_date).toLocaleString()}</td>
                      <td className="px-3 py-2 text-red-400/70 text-xs max-w-xs truncate">{evt.error_message || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}