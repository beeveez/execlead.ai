import React, { useState, useEffect } from "react";
import { EMAIL_PROVIDERS, maskApiKey } from "@/lib/emailProvider";
import { Save, Loader2, CheckCircle, KeyRound, ShieldCheck } from "lucide-react";

export default function ProviderConfigForm({ settings, onSave, saving, saved }) {
  const [form, setForm] = useState(settings || {});
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [editingKey, setEditingKey] = useState(false);

  useEffect(() => {
    setForm(settings || {});
    setApiKeyInput("");
    setEditingKey(false);
  }, [settings]);

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSave = () => {
    const payload = { ...form };
    if (editingKey && apiKeyInput) {
      payload.api_key = apiKeyInput;
    } else {
      delete payload.api_key;
    }
    onSave(payload);
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50";
  const labelClass = "text-white/40 text-xs uppercase tracking-wider mb-1.5 block";
  const isSES = form.provider === "ses";

  const statusDot = (status, verifiedMap, errorMap, pendingMap) => {
    if (verifiedMap.includes(status)) return "bg-emerald-400";
    if (errorMap.includes(status)) return "bg-red-400";
    if (pendingMap.includes(status)) return "bg-amber-400";
    return "bg-white/30";
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Provider Configuration</h3>
        <span className="inline-flex items-center gap-1 text-xs text-emerald-400/60"><ShieldCheck size={11} /> API keys encrypted</span>
      </div>

      {/* Provider selection */}
      <div>
        <label className={labelClass}>Email Provider</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {Object.values(EMAIL_PROVIDERS).map(p => (
            <button
              key={p.id}
              onClick={() => update("provider", p.id)}
              className={`p-4 rounded-lg text-left transition-all ${form?.provider === p.id ? "bg-indigo-500/15 ring-1 ring-indigo-500/30" : "bg-white/5 hover:bg-white/10"}`}
            >
              <div className="text-white font-semibold text-sm">{p.name}</div>
              <div className="text-white/30 text-xs mt-1">{p.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* API Key — masked, never exposed */}
      <div>
        <label className={labelClass}>
          API Key
          {settings?.api_key && !editingKey && <span className="text-emerald-400 normal-case ml-1">• Configured</span>}
        </label>
        {settings?.api_key && !editingKey ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5">
              <KeyRound size={14} className="text-white/30" />
              <span className="text-sm text-white/40 font-mono">{maskApiKey(settings.api_key)}</span>
            </div>
            <button
              onClick={() => { setEditingKey(true); setApiKeyInput(""); }}
              className="px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs transition-colors whitespace-nowrap"
            >
              Change
            </button>
          </div>
        ) : (
          <input
            type="password"
            value={apiKeyInput}
            onChange={e => setApiKeyInput(e.target.value)}
            placeholder={editingKey ? "Enter new API key" : "Enter API key"}
            className={inputClass}
          />
        )}
      </div>

      {/* From Name / From Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>From Name</label>
          <input value={form?.from_name || ""} onChange={e => update("from_name", e.target.value)} placeholder="EXECLEAD.AI" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>From Email</label>
          <input value={form?.from_email || ""} onChange={e => update("from_email", e.target.value)} placeholder="noreply@execlead.ai" className={inputClass} />
        </div>
      </div>

      {/* Reply-To */}
      <div>
        <label className={labelClass}>Reply-To Email</label>
        <input value={form?.reply_to_email || ""} onChange={e => update("reply_to_email", e.target.value)} placeholder="support@execlead.ai" className={inputClass} />
      </div>

      {/* Support / Sales / Security emails */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Support Email</label>
          <input value={form?.support_email || ""} onChange={e => update("support_email", e.target.value)} placeholder="support@execlead.ai" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Sales Email</label>
          <input value={form?.sales_email || ""} onChange={e => update("sales_email", e.target.value)} placeholder="sales@execlead.ai" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Security Email</label>
          <input value={form?.security_email || ""} onChange={e => update("security_email", e.target.value)} placeholder="security@execlead.ai" className={inputClass} />
        </div>
      </div>

      {/* Region (SES only) */}
      {isSES && (
        <div>
          <label className={labelClass}>AWS Region</label>
          <select value={form?.region || ""} onChange={e => update("region", e.target.value)} className={inputClass}>
            <option value="">Select region…</option>
            <option value="us-east-1">us-east-1 (N. Virginia)</option>
            <option value="us-west-2">us-west-2 (Oregon)</option>
            <option value="eu-west-1">eu-west-1 (Ireland)</option>
            <option value="eu-central-1">eu-central-1 (Frankfurt)</option>
            <option value="ap-south-1">ap-south-1 (Mumbai)</option>
            <option value="ap-southeast-1">ap-southeast-1 (Singapore)</option>
            <option value="ap-northeast-1">ap-northeast-1 (Tokyo)</option>
          </select>
        </div>
      )}

      {/* Webhook Secret */}
      <div>
        <label className={labelClass}>Webhook Secret</label>
        <input value={form?.webhook_secret || ""} onChange={e => update("webhook_secret", e.target.value)} placeholder="whsec_..." className={inputClass} />
      </div>

      {/* Domain & Connection Status (read-only display) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Domain Verification Status</label>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5">
            <span className={`w-2 h-2 rounded-full ${statusDot(form?.domain_verification_status, ["verified"], ["failed"], ["pending"])}`} />
            <span className="text-sm text-white/50 capitalize">{(form?.domain_verification_status || "not_started").replace("_", " ")}</span>
          </div>
        </div>
        <div>
          <label className={labelClass}>Connection Status</label>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5">
            <span className={`w-2 h-2 rounded-full ${statusDot(form?.connection_status, ["connected"], ["error", "disconnected"], [])}`} />
            <span className="text-sm text-white/50 capitalize">{form?.connection_status || "untested"}</span>
          </div>
        </div>
      </div>

      {/* Active toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form?.is_active ?? true} onChange={e => update("is_active", e.target.checked)} className="w-4 h-4 rounded bg-white/5 border-white/20 text-indigo-500" />
        <span className="text-sm text-white/60">Active — enable transactional email sending</span>
      </label>

      {/* Save */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Settings
        </button>
        {saved && <span className="text-emerald-400 text-sm flex items-center gap-1"><CheckCircle size={14} /> Saved</span>}
      </div>
    </div>
  );
}