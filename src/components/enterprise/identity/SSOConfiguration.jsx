import React, { useState, useEffect } from "react";
import { Loader2, Shield, KeyRound, Lock, Smartphone, Monitor, Clock, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { SSO_PROTOCOLS } from "@/lib/identityProviders";

const PROTOCOL_ICONS = { saml: Shield, oidc: KeyRound, oauth: KeyRound, passwordless: Smartphone, mfa: Lock, conditional_access: Shield, trusted_devices: Monitor, session_policies: Clock };

export default function SSOConfiguration({ organization }) {
  const { toast } = useToast();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [configs, setConfigs] = useState({});

  useEffect(() => { if (organization?.id) loadProviders(); }, [organization?.id]);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const provs = await base44.entities.IdentityProvider.filter({ organization_id: organization.id, status: "connected" });
      setProviders(provs);
      const saml = provs.some((p) => p.protocols?.includes("SAML") && p.sso_enabled);
      const oidc = provs.some((p) => p.protocols?.includes("OIDC") && p.sso_enabled);
      setConfigs({ saml, oidc, oauth: oidc, passwordless: false, mfa: false, conditional_access: false, trusted_devices: false, session_policies: true });
    } catch (e) { console.error("SSO load failed:", e); }
    finally { setLoading(false); }
  };

  const toggle = (id) => {
    setConfigs((c) => {
      const next = { ...c, [id]: !c[id] };
      toast({ title: next[id] ? "Enabled" : "Disabled", description: SSO_PROTOCOLS.find((s) => s.id === id)?.name });
      return next;
    });
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-400" size={24} /></div>;

  const enabledCount = Object.values(configs).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="SSO Protocols" value={`${enabledCount} / ${SSO_PROTOCOLS.length}`} icon={Shield} color="indigo" />
        <Stat label="Connected IdPs" value={providers.length} icon={KeyRound} color="blue" />
        <Stat label="SAML Active" value={configs.saml ? "Yes" : "No"} icon={Shield} color={configs.saml ? "emerald" : "red"} />
        <Stat label="OIDC Active" value={configs.oidc ? "Yes" : "No"} icon={KeyRound} color={configs.oidc ? "emerald" : "red"} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SSO_PROTOCOLS.map((proto) => {
          const Icon = PROTOCOL_ICONS[proto.id] || Shield;
          const enabled = configs[proto.id];
          return (
            <div key={proto.id} className={`bg-white/[0.02] border rounded-xl p-4 ${enabled ? "border-emerald-500/20" : "border-white/5"}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${enabled ? "bg-emerald-500/10" : "bg-white/5"}`}>
                    <Icon size={16} className={enabled ? "text-emerald-400" : "text-white/40"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium">{proto.name}</div>
                    <p className="text-white/40 text-xs mt-0.5 leading-relaxed">{proto.desc}</p>
                  </div>
                </div>
                <button onClick={() => toggle(proto.id)} className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${enabled ? "bg-emerald-500" : "bg-white/10"}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
              {enabled && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400">
                  <Check size={10} /> Active for {providers.length} provider{providers.length !== 1 ? "s" : ""}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2"><Shield size={14} className="text-amber-400" /><span className="text-white/80 text-sm font-semibold uppercase tracking-wider">Conditional Access Rules</span></div>
        <div className="space-y-2 text-sm">
          <Rule text="Require MFA for admin roles" active={configs.mfa} />
          <Rule text="Block logins from untrusted locations" active={configs.conditional_access} />
          <Rule text="Require trusted device for enterprise workspace" active={configs.trusted_devices} />
          <Rule text="Session timeout after 8 hours of inactivity" active={configs.session_policies} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon, color }) {
  const map = { indigo: "text-indigo-400", blue: "text-blue-400", emerald: "text-emerald-400", red: "text-red-400" };
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1"><Icon size={14} className={map[color]} /><span className="text-white/40 text-xs uppercase tracking-wider">{label}</span></div>
      <div className="text-white text-2xl font-bold">{value}</div>
    </div>
  );
}

function Rule({ text, active }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${active ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/30"}`}>{active ? "✓" : "—"}</span>
      <span className={active ? "text-white/60" : "text-white/30"}>{text}</span>
    </div>
  );
}