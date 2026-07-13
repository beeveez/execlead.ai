import React, { useState } from "react";
import { Copy, RefreshCw, KeyRound, Check, Loader2, ExternalLink, ShieldCheck, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { appParams } from "@/lib/app-params";
import { useToast } from "@/components/ui/use-toast";

export default function SCIMEndpointConfig({ provider, onUpdate }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const config = (() => {
    try { return JSON.parse(provider.config_json || "{}"); } catch { return {}; }
  })();
  const hasToken = !!config.scim_token;
  const scimBaseUrl = `https://api.base44.com/v2/apps/${appParams.appId}/functions/scimServer`;
  const maskedToken = hasToken ? `${config.scim_token.substring(0, 8)}••••••••` : "—";

  const copyUrl = () => {
    navigator.clipboard.writeText(scimBaseUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateToken = async () => {
    setGenerating(true);
    try {
      const newToken = crypto.randomUUID();
      const newConfig = { ...config, scim_token: newToken, scim_token_generated_at: new Date().toISOString() };
      await base44.entities.IdentityProvider.update(provider.id, {
        config_json: JSON.stringify(newConfig),
        scim_enabled: true,
      });
      onUpdate({ ...provider, config_json: JSON.stringify(newConfig), scim_enabled: true });
      toast({ title: "SCIM token generated", description: "Bearer token ready for IdP configuration." });
    } catch (e) {
      toast({ title: "Token generation failed", description: e.message, variant: "destructive" });
    } finally { setGenerating(false); }
  };

  const runTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await base44.functions.invoke("scimServer", { action: "test", provider_id: provider.id });
      setTestResult(res.data);
      toast({ title: "SCIM test passed", description: res.data?.message });
    } catch (e) {
      setTestResult({ status: "error", message: e.message });
      toast({ title: "SCIM test failed", description: e.message, variant: "destructive" });
    } finally { setTesting(false); }
  };

  return (
    <div className="space-y-3">
      {/* Endpoint URL */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <ExternalLink size={14} className="text-indigo-400" />
          <h4 className="text-white/80 text-xs font-semibold uppercase tracking-wider">SCIM 2.0 Base URL</h4>
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 font-mono truncate">{scimBaseUrl}</code>
          <button onClick={copyUrl} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 transition-colors shrink-0">
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {["/Users", "/Groups", "/ServiceProviderConfig", "/ResourceTypes"].map((p) => (
            <code key={p} className="text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded font-mono">{p}</code>
          ))}
        </div>
      </div>

      {/* Bearer Token */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <KeyRound size={14} className="text-amber-400" />
          <h4 className="text-white/80 text-xs font-semibold uppercase tracking-wider">Bearer Token</h4>
          {hasToken && <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">Active</span>}
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 font-mono">{maskedToken}</code>
          <button onClick={generateToken} disabled={generating} className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 disabled:opacity-50 shrink-0">
            {generating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            {hasToken ? "Regenerate" : "Generate"}
          </button>
        </div>
        <p className="text-white/30 text-[11px] mt-2">Configure this token in your IdP's SCIM provisioning settings under "Bearer Token" / "Secret Token".</p>
      </div>

      {/* Test Endpoint */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className={hasToken ? "text-emerald-400" : "text-amber-400"} />
            <h4 className="text-white/80 text-xs font-semibold uppercase tracking-wider">Endpoint Test</h4>
          </div>
          <button onClick={runTest} disabled={testing} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium flex items-center gap-1.5 disabled:opacity-50">
            {testing ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
            Test Connection
          </button>
        </div>
        {testResult && (
          <div className={`mt-3 p-3 rounded-lg text-xs ${testResult.status === "success" ? "bg-emerald-500/5 border border-emerald-500/20" : "bg-red-500/5 border border-red-500/20"}`}>
            {testResult.status === "success" ? (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400"><Check size={12} /> {testResult.message}</div>
                <div className="flex gap-4 text-white/40 text-[11px] mt-1">
                  <span>Users: {testResult.users_available}</span>
                  <span>Groups: {testResult.groups_available}</span>
                  <span>Events: {testResult.recent_events}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-red-400"><AlertCircle size={12} /> {testResult.message}</div>
            )}
          </div>
        )}
      </div>

      {/* IdP Setup Instructions */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <h4 className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-3">IdP Integration Guides</h4>
        <div className="space-y-2 text-xs">
          {[
            { name: "Microsoft Entra ID", steps: "Enterprise Apps → New App → Non-gallery → Provisioning → SCIM 2.0" },
            { name: "Okta", steps: "Applications → Browse App Catalog → SCIM 2.0 → enter Base URL + Token" },
            { name: "Google Workspace", steps: "Admin → Directory → Provisioning → SCIM → configure endpoint" },
          ].map((idp) => (
            <div key={idp.name} className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02]">
              <span className="text-white/60 font-medium shrink-0 w-32">{idp.name}</span>
              <span className="text-white/40">{idp.steps}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}