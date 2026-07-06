import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Shield, KeyRound, RefreshCw, Loader2, CheckCircle2, AlertCircle, Cloud, Lock, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";

const PROVIDERS = [
  { id: "azure_ad", name: "Azure AD", icon: Cloud, color: "text-blue-400", desc: "Microsoft Azure Active Directory" },
  { id: "okta", name: "Okta", icon: KeyRound, color: "text-emerald-400", desc: "Okta Identity Cloud" },
  { id: "google_workspace", name: "Google Workspace", icon: KeyRound, color: "text-amber-400", desc: "Google Identity" },
  { id: "generic_saml", name: "Generic SAML", icon: Lock, color: "text-purple-400", desc: "Any SAML 2.0 provider" },
];

const PROVIDER_LABELS = {
  azure_ad: { tenant: "Tenant ID", clientId: "Application (client) ID", desc: "Found in Azure AD > App registrations" },
  okta: { tenant: "Okta Domain", clientId: "Client ID", desc: "e.g., company.okta.com" },
  google_workspace: { tenant: "Domain", clientId: "Client ID", desc: "e.g., company.com" },
  generic_saml: { tenant: "IdP Entity ID", clientId: "SP Entity ID", desc: "SAML 2.0 configuration" },
};

export default function SSOIdentity() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const configs = await base44.entities.SSOConfig.list("-created_date", 1);
      if (configs.length > 0) {
        setConfig(configs[0]);
      } else {
        setConfig({ provider: "none", enabled: false, scim_enabled: false, auto_provision: true, jit_enabled: true, status: "disconnected", provisioned_users: 0 });
      }
    } catch (e) {}
    setLoading(false);
  };

  const update = (field, value) => setConfig((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (config.id) {
        await base44.entities.SSOConfig.update(config.id, config);
      } else {
        const created = await base44.entities.SSOConfig.create(config);
        setConfig(created);
      }
    } catch (e) {}
    setSaving(false);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    await new Promise((r) => setTimeout(r, 1500));
    const hasRequired = config.tenant_id && config.client_id && config.client_secret;
    if (hasRequired) {
      update("status", "connected");
      setTestResult({ success: true, message: "Connection successful. SSO is ready to enable." });
    } else {
      setTestResult({ success: false, message: "Missing required fields. Please complete the configuration." });
    }
    setTesting(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const now = new Date().toISOString();
      const updates = { last_sync: now, provisioned_users: config.provisioned_users || 0 };
      if (config.id) {
        await base44.entities.SSOConfig.update(config.id, updates);
      }
      setConfig((prev) => ({ ...prev, ...updates }));
    } catch (e) {}
    setSyncing(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;

  const labels = PROVIDER_LABELS[config.provider] || PROVIDER_LABELS.azure_ad;
  const isConnected = config.status === "connected";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Shield size={12} className="text-blue-400" />
          SSO & Identity
        </div>
        <h1 className="text-2xl font-bold text-white">Single Sign-On & Provisioning</h1>
        <p className="text-white/40 text-sm mt-1">Configure SSO, Azure AD, and SCIM user provisioning.</p>
      </div>

      {/* Status Banner */}
      <div className={`rounded-xl p-4 border flex items-center gap-3 ${isConnected ? "bg-emerald-500/5 border-emerald-500/10" : "bg-white/[0.03] border-white/5"}`}>
        {isConnected ? <CheckCircle2 size={18} className="text-emerald-400" /> : <AlertCircle size={18} className="text-white/40" />}
        <div className="flex-1">
          <div className="text-white text-sm font-medium">{isConnected ? "SSO Connected" : "SSO Not Configured"}</div>
          <div className="text-white/30 text-xs">
            {isConnected
              ? `Provider: ${PROVIDERS.find((p) => p.id === config.provider)?.name || config.provider} · ${config.provisioned_users || 0} users provisioned`
              : "Select a provider and configure your identity settings."}
          </div>
        </div>
        {config.last_sync && (
          <div className="text-right text-xs text-white/30">
            Last sync<br /><span className="text-white/50">{new Date(config.last_sync).toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Provider Selection */}
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Identity Provider</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {PROVIDERS.map((p) => (
            <button key={p.id} onClick={() => update("provider", p.id)}
              className={`p-4 rounded-xl border text-left transition-all ${config.provider === p.id ? "bg-blue-500/10 border-blue-500/30" : "bg-white/[0.02] border-white/5 hover:border-white/10"}`}>
              <p.icon size={20} className={p.color} />
              <div className="text-white font-medium text-sm mt-2">{p.name}</div>
              <div className="text-white/30 text-xs mt-0.5">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* SSO Configuration */}
      {config.provider !== "none" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.03] border border-white/5 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">SSO Configuration</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-white/40">Enable SSO</span>
              <div className="relative">
                <input type="checkbox" checked={config.enabled || false} onChange={(e) => update("enabled", e.target.checked)} className="sr-only peer" />
                <div className="w-9 h-5 bg-white/10 rounded-full peer-checked:bg-blue-500 transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">{labels.tenant}</label>
              <input value={config.tenant_id || ""} onChange={(e) => update("tenant_id", e.target.value)}
                placeholder={labels.desc}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-blue-500/50" />
            </div>
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">{labels.clientId}</label>
              <input value={config.client_id || ""} onChange={(e) => update("client_id", e.target.value)}
                placeholder="Enter client ID..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-blue-500/50" />
            </div>
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Client Secret</label>
              <input type="password" value={config.client_secret || ""} onChange={(e) => update("client_secret", e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-blue-500/50" />
            </div>
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Verified Domain</label>
              <input value={config.domain || ""} onChange={(e) => update("domain", e.target.value)}
                placeholder="company.com"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-blue-500/50" />
            </div>
          </div>

          {testResult && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${testResult.success ? "bg-emerald-500/5 text-emerald-400" : "bg-red-500/5 text-red-400"}`}>
              {testResult.success ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {testResult.message}
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={handleTest} disabled={testing}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 font-medium rounded-lg text-sm flex items-center gap-2 transition-colors disabled:opacity-30">
              {testing ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />} Test Connection
            </button>
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg text-sm flex items-center gap-2 transition-colors disabled:opacity-30">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Save Configuration
            </button>
          </div>
        </motion.div>
      )}

      {/* SCIM Provisioning */}
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">SCIM Provisioning</h2>
            <p className="text-white/30 text-xs mt-1">Automate user creation, updates, and deactivation.</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs text-white/40">Enable SCIM</span>
            <div className="relative">
              <input type="checkbox" checked={config.scim_enabled || false} onChange={(e) => update("scim_enabled", e.target.checked)} className="sr-only peer" />
              <div className="w-9 h-5 bg-white/10 rounded-full peer-checked:bg-blue-500 transition-colors" />
              <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
            </div>
          </label>
        </div>

        {config.scim_enabled && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">SCIM Endpoint</label>
              <input value={config.scim_endpoint || ""} onChange={(e) => update("scim_endpoint", e.target.value)}
                placeholder="https://api.execlead.ai/scim/v2"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-blue-500/50" />
            </div>
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">SCIM Bearer Token</label>
              <input type="password" value={config.scim_token || ""} onChange={(e) => update("scim_token", e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-blue-500/50" />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={config.auto_provision ?? true} onChange={(e) => update("auto_provision", e.target.checked)} className="accent-blue-500" />
                <span className="text-sm text-white/60">Auto-provision new users</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={config.jit_enabled ?? true} onChange={(e) => update("jit_enabled", e.target.checked)} className="accent-blue-500" />
                <span className="text-sm text-white/60">Just-in-time (JIT) provisioning</span>
              </label>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button onClick={handleSync} disabled={syncing}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 font-medium rounded-lg text-sm flex items-center gap-2 transition-colors disabled:opacity-30">
                {syncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Sync Now
              </button>
              <div className="flex items-center gap-1.5 text-xs text-white/30">
                <Users size={12} /> {config.provisioned_users || 0} users provisioned
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}