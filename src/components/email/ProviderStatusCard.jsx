import React from "react";
import {
  Mail, Globe, KeyRound, BarChart3, CheckCircle, XCircle,
  Inbox, Clock, TrendingUp, TrendingDown, Activity,
} from "lucide-react";
import { EMAIL_PROVIDERS, maskApiKey } from "@/lib/emailProvider";

export default function ProviderStatusCard({ settings, lastSuccessful }) {
  const provider = EMAIL_PROVIDERS[settings?.provider] || EMAIL_PROVIDERS.resend;
  const isConnected = settings?.connection_status === "connected";
  const hasApiKey = !!settings?.api_key;
  const domain = settings?.from_email ? settings.from_email.split("@")[1] : "—";

  const overallStatus = !settings?.is_active
    ? { label: "Inactive", color: "text-white/40", dot: "bg-white/30", bg: "bg-white/5", border: "border-white/10" }
    : isConnected
      ? { label: "Operational", color: "text-emerald-400", dot: "bg-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/20" }
      : settings?.connection_status === "untested"
        ? { label: "Untested", color: "text-amber-400", dot: "bg-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/20" }
        : { label: "Error", color: "text-red-400", dot: "bg-red-400", bg: "bg-red-500/5", border: "border-red-500/20" };

  const rows = [
    { icon: Mail, label: "Connected Provider", value: provider.name },
    { icon: Globe, label: "Domain", value: domain },
    { icon: KeyRound, label: "API Key", value: hasApiKey ? maskApiKey(settings.api_key) : "Not configured" },
    { icon: Activity, label: "Last Health Check", value: settings?.last_tested_at ? new Date(settings.last_tested_at).toLocaleString() : "Never" },
    { icon: CheckCircle, label: "Last Successful Email", value: lastSuccessful ? new Date(lastSuccessful.created_date).toLocaleString() : "Never" },
  ];

  return (
    <div className={`rounded-xl border ${overallStatus.border} ${overallStatus.bg} p-5`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Provider Status</h3>
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${overallStatus.bg} border ${overallStatus.border}`}>
          <span className={`w-2 h-2 rounded-full ${overallStatus.dot} ${isConnected ? "animate-pulse" : ""}`} />
          <span className={overallStatus.color}>{overallStatus.label}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {rows.map((r, i) => (
          <div key={i} className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
            <div className="flex items-center gap-1.5 text-white/30 text-[10px] uppercase tracking-wider mb-1.5">
              <r.icon size={11} /> {r.label}
            </div>
            <div className="text-sm text-white/70 font-medium truncate" title={r.value}>{r.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}